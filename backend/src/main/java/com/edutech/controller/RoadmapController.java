package com.edutech.controller;

import com.edutech.model.LearningRoadmap;
import com.edutech.model.StudentProfile;
import com.edutech.model.User;
import com.edutech.repository.LearningRoadmapRepository;
import com.edutech.repository.StudentProfileRepository;
import com.edutech.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/roadmaps")
public class RoadmapController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private LearningRoadmapRepository learningRoadmapRepository;

    @GetMapping
    public ResponseEntity<?> getRoadmap() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userOpt.get().getId());
        if (profileOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Profile not found. Please onboard first."));
        }

        Optional<LearningRoadmap> roadmapOpt = learningRoadmapRepository.findByStudentProfileId(profileOpt.get().getId());
        if (roadmapOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("hasRoadmap", false));
        }

        return ResponseEntity.ok(Map.of(
                "hasRoadmap", true,
                "roadmap", roadmapOpt.get().getRoadmapData()
        ));
    }
}
