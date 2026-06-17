package com.edutech.controller;

import com.edutech.model.*;
import com.edutech.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private KnowledgeGapRepository knowledgeGapRepository;

    @Autowired
    private PerformancePredictionRepository performancePredictionRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @GetMapping("/student")
    public ResponseEntity<?> getStudentAnalytics() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userOpt.get().getId());
        if (profileOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Profile not found"));
        }

        StudentProfile profile = profileOpt.get();

        List<QuizAttempt> attempts = quizAttemptRepository.findByStudentProfileIdOrderByCompletedAtDesc(profile.getId());
        List<KnowledgeGap> gaps = knowledgeGapRepository.findByStudentProfileId(profile.getId());
        List<PerformancePrediction> predictions = performancePredictionRepository.findByStudentProfileIdOrderByCreatedAtDesc(profile.getId());

        PerformancePrediction latestPrediction = predictions.isEmpty() ? null : predictions.get(0);

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("quizAttempts", attempts);
        analytics.put("knowledgeGaps", gaps);
        analytics.put("latestPrediction", latestPrediction);
        analytics.put("totalQuizzesTaken", attempts.size());
        analytics.put("averageScore", attempts.stream().mapToDouble(QuizAttempt::getScore).average().orElse(0.0));

        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/admin")
    public ResponseEntity<?> getAdminAnalytics() {
        // Simple authentication check - check if role is ADMIN
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty() || !userOpt.get().getRole().name().equals("ADMIN")) {
            // We also accept TEACHER for analytics access
            if (userOpt.isPresent() && userOpt.get().getRole().name().equals("TEACHER")) {
                // Allow
            } else {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. Admin or Teacher role required."));
            }
        }

        long totalStudents = studentProfileRepository.countTotalStudents();
        long totalQuizAttempts = quizAttemptRepository.countTotalAttempts();
        Double avgScore = quizAttemptRepository.getAverageScore();
        long totalResources = resourceRepository.count();

        // Get resource formatting statistics
        List<Resource> allResources = resourceRepository.findAll();
        Map<String, Long> formatDistribution = allResources.stream()
                .collect(Collectors.groupingBy(Resource::getFormat, Collectors.counting()));

        // Get student overview list
        List<StudentProfile> students = studentProfileRepository.findAll();
        List<Map<String, Object>> studentSummaryList = students.stream().map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("name", s.getName());
            map.put("email", s.getUser() != null ? s.getUser().getEmail() : "");
            map.put("age", s.getAge());
            map.put("educationLevel", s.getEducationLevel());
            map.put("careerInterest", s.getCareerInterest());
            map.put("learningStyle", s.getLearningStyle());
            
            // Add attempt statistics
            List<QuizAttempt> studentAttempts = quizAttemptRepository.findByStudentProfileIdOrderByCompletedAtDesc(s.getId());
            map.put("quizzesTaken", studentAttempts.size());
            map.put("avgScore", studentAttempts.stream().mapToDouble(QuizAttempt::getScore).average().orElse(0.0));
            
            List<PerformancePrediction> preds = performancePredictionRepository.findByStudentProfileIdOrderByCreatedAtDesc(s.getId());
            if (!preds.isEmpty()) {
                map.put("predictedGrade", preds.get(0).getPredictedGrade());
                map.put("riskLevel", preds.get(0).getRiskLevel());
            } else {
                map.put("predictedGrade", "N/A");
                map.put("riskLevel", "N/A");
            }
            
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> adminData = new HashMap<>();
        adminData.put("totalStudents", totalStudents);
        adminData.put("totalQuizAttempts", totalQuizAttempts);
        adminData.put("averageScore", avgScore != null ? avgScore : 0.0);
        adminData.put("totalResources", totalResources);
        adminData.put("resourceFormatDistribution", formatDistribution);
        adminData.put("students", studentSummaryList);

        return ResponseEntity.ok(adminData);
    }
}
