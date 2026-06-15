package com.edutech.controller;

import com.edutech.config.AiServiceClient;
import com.edutech.model.*;
import com.edutech.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/students")
public class StudentController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private LearningRoadmapRepository learningRoadmapRepository;

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private AiServiceClient aiServiceClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userOpt.get().getId());
        if (profileOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("hasProfile", false));
        }

        StudentProfile profile = profileOpt.get();
        Map<String, Object> response = new HashMap<>();
        response.put("hasProfile", true);
        response.put("profile", profile);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/profile")
    public ResponseEntity<?> createOrUpdateProfile(@RequestBody Map<String, Object> request) {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        Optional<StudentProfile> existingProfile = studentProfileRepository.findByUserId(user.getId());

        StudentProfile profile = existingProfile.orElseGet(() -> StudentProfile.builder().user(user).build());

        profile.setName((String) request.get("name"));
        profile.setAge(Integer.parseInt(request.get("age").toString()));
        profile.setEducationLevel((String) request.get("educationLevel"));
        profile.setLearningStyle((String) request.get("learningStyle"));
        profile.setCareerInterest((String) request.get("careerInterest"));
        profile.setDailyStudyTime(Double.parseDouble(request.get("dailyStudyTime").toString()));

        // Convert Lists to comma separated strings
        profile.setPreferredSubjects(String.join(",", (List<String>) request.get("preferredSubjects")));
        profile.setStrengthAreas(String.join(",", (List<String>) request.get("strengthAreas")));
        profile.setWeakAreas(String.join(",", (List<String>) request.get("weakAreas")));

        studentProfileRepository.save(profile);

        // 1. Trigger AI Roadmap Generation asynchronously/synchronously and save
        try {
            Map<String, Object> roadmapPayload = new HashMap<>();
            roadmapPayload.put("name", profile.getName());
            roadmapPayload.put("age", profile.getAge());
            roadmapPayload.put("education_level", profile.getEducationLevel());
            roadmapPayload.put("learning_style", profile.getLearningStyle());
            roadmapPayload.put("career_interest", profile.getCareerInterest());
            roadmapPayload.put("preferred_subjects", Arrays.asList(profile.getPreferredSubjects().split(",")));
            roadmapPayload.put("daily_study_time", profile.getDailyStudyTime());
            roadmapPayload.put("strength_areas", Arrays.asList(profile.getStrengthAreas().split(",")));
            roadmapPayload.put("weak_areas", Arrays.asList(profile.getWeakAreas().split(",")));

            String roadmapJson = aiServiceClient.generateRoadmap(roadmapPayload);

            Optional<LearningRoadmap> existingRoadmap = learningRoadmapRepository.findByStudentProfileId(profile.getId());
            LearningRoadmap roadmap = existingRoadmap.orElseGet(() -> LearningRoadmap.builder().studentProfile(profile).build());
            roadmap.setRoadmapData(roadmapJson);
            learningRoadmapRepository.save(roadmap);

        } catch (Exception e) {
            System.err.println("Failed to auto-generate roadmap during onboarding: " + e.getMessage());
        }

        // 2. Trigger AI Recommendations and populate recommendations
        try {
            recommendationRepository.deleteByStudentProfileId(profile.getId());

            Map<String, Object> recPayload = new HashMap<>();
            recPayload.put("preferred_subjects", Arrays.asList(profile.getPreferredSubjects().split(",")));
            recPayload.put("weak_areas", Arrays.asList(profile.getWeakAreas().split(",")));
            recPayload.put("learning_style", profile.getLearningStyle());

            String recJson = aiServiceClient.generateRecommendations(recPayload);
            List<Map<String, Object>> recList = objectMapper.readValue(recJson, new TypeReference<List<Map<String, Object>>>() {});

            for (Map<String, Object> recMap : recList) {
                // Find or create resource in db
                String title = (String) recMap.get("title");
                String url = (String) recMap.get("url");
                String desc = (String) recMap.get("description");
                String format = (String) recMap.get("format");
                String difficulty = (String) recMap.get("difficulty");
                String topic = (String) recMap.get("topic");
                int duration = Integer.parseInt(recMap.get("duration_mins").toString());

                Resource resource = Resource.builder()
                        .title(title)
                        .url(url)
                        .description(desc)
                        .format(format)
                        .difficulty(difficulty)
                        .topic(topic)
                        .durationMins(duration)
                        .build();
                resourceRepository.save(resource);

                Recommendation recommendation = Recommendation.builder()
                        .studentProfile(profile)
                        .resource(resource)
                        .score(Double.parseDouble(recMap.get("recommendation_score").toString()))
                        .reason((String) recMap.get("reason"))
                        .build();
                recommendationRepository.save(recommendation);
            }
        } catch (Exception e) {
            System.err.println("Failed to auto-generate recommendations: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "Profile onboarded successfully", "profileId", profile.getId().toString()));
    }
}
