package com.edutech.controller;

import com.edutech.config.AiServiceClient;
import com.edutech.model.CareerRecommendation;
import com.edutech.model.StudentProfile;
import com.edutech.model.User;
import com.edutech.repository.CareerRecommendationRepository;
import com.edutech.repository.StudentProfileRepository;
import com.edutech.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;

@RestController
@RequestMapping("/career")
public class CareerController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private CareerRecommendationRepository careerRecommendationRepository;

    @Autowired
    private AiServiceClient aiServiceClient;

    @GetMapping
    public ResponseEntity<?> getCareers() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userOpt.get().getId());
        if (profileOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Profile not found. Please onboard first."));
        }

        StudentProfile profile = profileOpt.get();

        Optional<CareerRecommendation> recommendationOpt = careerRecommendationRepository.findByStudentProfileId(profile.getId());
        if (recommendationOpt.isPresent()) {
            return ResponseEntity.ok(Map.of("careers", recommendationOpt.get().getCareersJson()));
        }

        try {
            Map<String, Object> careerPayload = new HashMap<>();
            
            List<String> interests = new ArrayList<>();
            if (profile.getCareerInterest() != null) interests.add(profile.getCareerInterest());
            if (profile.getPreferredSubjects() != null) {
                interests.addAll(Arrays.asList(profile.getPreferredSubjects().split(",")));
            }
            
            List<String> skills = new ArrayList<>();
            if (profile.getStrengthAreas() != null) {
                skills.addAll(Arrays.asList(profile.getStrengthAreas().split(",")));
            }

            careerPayload.put("interests", interests);
            careerPayload.put("skills", skills);

            String careerJson = aiServiceClient.generateCareers(careerPayload);

            CareerRecommendation newRecommendation = CareerRecommendation.builder()
                    .studentProfile(profile)
                    .careersJson(careerJson)
                    .build();
            careerRecommendationRepository.save(newRecommendation);

            return ResponseEntity.ok(Map.of("careers", careerJson));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to generate careers: " + e.getMessage()));
        }
    }
}
