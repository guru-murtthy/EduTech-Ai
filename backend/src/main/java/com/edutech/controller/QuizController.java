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
@RequestMapping("/quiz")
public class QuizController {

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
    private AiServiceClient aiServiceClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/generate")
    public ResponseEntity<?> generateQuiz(@RequestBody Map<String, String> request) {
        String topic = request.getOrDefault("topic", "Computer Science");
        
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

        // ADAPTIVE LOGIC: Determine difficulty based on previous attempts for this topic
        List<QuizAttempt> attempts = quizAttemptRepository.findByStudentProfileIdOrderByCompletedAtDesc(profile.getId());
        
        String difficulty = "Medium"; // Default
        Optional<QuizAttempt> lastAttemptOpt = attempts.stream()
                .filter(a -> a.getTopic().equalsIgnoreCase(topic))
                .findFirst();

        if (lastAttemptOpt.isPresent()) {
            QuizAttempt lastAttempt = lastAttemptOpt.get();
            String prevDiff = lastAttempt.getDifficulty();
            double prevScore = lastAttempt.getScore();

            if (prevScore >= 80.0) {
                if (prevDiff.equalsIgnoreCase("Easy")) difficulty = "Medium";
                else if (prevDiff.equalsIgnoreCase("Medium")) difficulty = "Hard";
                else difficulty = "Hard";
            } else if (prevScore <= 50.0) {
                if (prevDiff.equalsIgnoreCase("Hard")) difficulty = "Medium";
                else if (prevDiff.equalsIgnoreCase("Medium")) difficulty = "Easy";
                else difficulty = "Easy";
            } else {
                difficulty = prevDiff; // Maintain difficulty
            }
        }

        try {
            Map<String, Object> quizPayload = new HashMap<>();
            quizPayload.put("topic", topic);
            quizPayload.put("difficulty", difficulty);

            String quizQuestionsJson = aiServiceClient.generateQuiz(quizPayload);
            List<Map<String, Object>> questions = objectMapper.readValue(quizQuestionsJson, new TypeReference<List<Map<String, Object>>>() {});

            Map<String, Object> response = new HashMap<>();
            response.put("topic", topic);
            response.put("difficulty", difficulty);
            response.put("questions", questions);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to generate quiz: " + e.getMessage()));
        }
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitQuiz(@RequestBody Map<String, Object> request) {
        String topic = (String) request.get("topic");
        String difficulty = (String) request.get("difficulty");
        double score = Double.parseDouble(request.get("score").toString());
        int totalQuestions = Integer.parseInt(request.get("totalQuestions").toString());

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

        // 1. Save Quiz Attempt
        QuizAttempt attempt = QuizAttempt.builder()
                .studentProfile(profile)
                .topic(topic)
                .difficulty(difficulty)
                .score(score)
                .totalQuestions(totalQuestions)
                .build();
        quizAttemptRepository.save(attempt);

        // 2. KNOWLEDGE GAP DETECTION
        // If score is less than 70%, trigger knowledge gap entry
        String feedback = "";
        String improvementSuggestions = "";
        if (score < 70.0) {
            feedback = "You have identified some concepts needing reinforcement in " + topic + ".";
            improvementSuggestions = "Review the recommended study guide in your Knowledge Gap dashboard.";
            
            KnowledgeGap gap = KnowledgeGap.builder()
                    .studentProfile(profile)
                    .weakTopic(topic)
                    .weakSkill("Conceptual accuracy in " + topic + " (" + difficulty + ")")
                    .improvementPlan("1. Watch the introductory concepts video. 2. Redo " + topic + " quiz at Easy difficulty. 3. Query the AI Tutor with specific questions.")
                    .suggestedResources("[{\"title\":\"" + topic + " Revision Notes\",\"format\":\"Article\",\"link\":\"#\"}]")
                    .build();
            knowledgeGapRepository.save(gap);
        } else {
            feedback = "Excellent job! You have demonstrated high proficiency in " + topic + ".";
            improvementSuggestions = "Keep progressing! Challenge yourself on higher difficulties or explore new subjects.";
        }

        // 3. PERFORMANCE PREDICTION (Random Forest call via FastAPI)
        try {
            List<QuizAttempt> allAttempts = quizAttemptRepository.findByStudentProfileIdOrderByCompletedAtDesc(profile.getId());
            List<Float> quizScores = new ArrayList<>();
            for (QuizAttempt qa : allAttempts) {
                quizScores.add((float) qa.getScore());
            }
            if (quizScores.isEmpty()) {
                quizScores.add((float) score);
            }

            double quizAvg = quizScores.stream().mapToDouble(Float::doubleValue).average().orElse(0.0);
            
            // Calculate completion rate based on quiz scores or simulate
            double completionRate = Math.min(100.0, allAttempts.size() * 10.0 + 10.0); // Simulated completion rate
            double studyTime = profile.getDailyStudyTime() * 7.0; // Weekly hours

            Map<String, Object> predictPayload = new HashMap<>();
            predictPayload.put("quiz_scores", quizScores);
            predictPayload.put("completion_rate", completionRate);
            predictPayload.put("study_time", studyTime);

            String predictionJson = aiServiceClient.predictPerformance(predictPayload);
            Map<String, Object> predictionMap = objectMapper.readValue(predictionJson, new TypeReference<Map<String, Object>>() {});

            PerformancePrediction prediction = PerformancePrediction.builder()
                    .studentProfile(profile)
                    .predictedGrade((String) predictionMap.get("predicted_grade"))
                    .successProbability(Double.parseDouble(predictionMap.get("success_probability").toString()))
                    .riskLevel((String) predictionMap.get("risk_level"))
                    .build();
            performancePredictionRepository.save(prediction);

        } catch (Exception e) {
            System.err.println("Failed to run performance prediction: " + e.getMessage());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("score", score);
        response.put("feedback", feedback);
        response.put("improvementSuggestions", improvementSuggestions);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/attempts")
    public ResponseEntity<?> getAttempts() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userOpt.get().getId());
        if (profileOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Profile not found"));
        }

        List<QuizAttempt> attempts = quizAttemptRepository.findByStudentProfileIdOrderByCompletedAtDesc(profileOpt.get().getId());
        return ResponseEntity.ok(attempts);
    }
}
