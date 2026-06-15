package com.edutech.controller;

import com.edutech.model.Recommendation;
import com.edutech.model.StudentProfile;
import com.edutech.model.User;
import com.edutech.repository.RecommendationRepository;
import com.edutech.repository.StudentProfileRepository;
import com.edutech.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/recommendations")
public class RecommendationController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private RecommendationRepository recommendationRepository;

    @GetMapping
    public ResponseEntity<?> getRecommendations() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userOpt.get().getId());
        if (profileOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Profile not found. Please onboard first."));
        }

        List<Recommendation> recommendations = recommendationRepository.findByStudentProfileId(profileOpt.get().getId());

        // Sort by score descending
        List<Map<String, Object>> formattedRecs = recommendations.stream()
                .sorted(Comparator.comparingDouble(Recommendation::getScore).reversed())
                .map(r -> {
                    Map<String, Object> map = Map.of(
                            "id", r.getId(),
                            "title", r.getResource().getTitle(),
                            "url", r.getResource().getUrl(),
                            "description", r.getResource().getDescription(),
                            "format", r.getResource().getFormat(),
                            "difficulty", r.getResource().getDifficulty(),
                            "topic", r.getResource().getTopic(),
                            "durationMins", r.getResource().getDurationMins(),
                            "score", r.getScore(),
                            "reason", r.getReason()
                    );
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(formattedRecs);
    }
}
