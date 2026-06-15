package com.edutech.controller;

import com.edutech.config.AiServiceClient;
import com.edutech.model.ChatHistory;
import com.edutech.model.StudentProfile;
import com.edutech.model.User;
import com.edutech.repository.ChatHistoryRepository;
import com.edutech.repository.StudentProfileRepository;
import com.edutech.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private ChatHistoryRepository chatHistoryRepository;

    @Autowired
    private AiServiceClient aiServiceClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/history")
    public ResponseEntity<?> getHistory() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userOpt.get().getId());
        if (profileOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Profile not found"));
        }

        List<ChatHistory> history = chatHistoryRepository.findByStudentProfileIdOrderByCreatedAtAsc(profileOpt.get().getId());
        
        List<Map<String, String>> formattedHistory = history.stream()
                .map(h -> Map.of("role", h.getRole(), "content", h.getMessage()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(formattedHistory);
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        if (prompt == null || prompt.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Prompt cannot be empty"));
        }

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

        // 1. Save student message
        ChatHistory userMessage = ChatHistory.builder()
                .studentProfile(profile)
                .role("user")
                .message(prompt)
                .build();
        chatHistoryRepository.save(userMessage);

        // 2. Load recent history
        List<ChatHistory> historyList = chatHistoryRepository.findByStudentProfileIdOrderByCreatedAtAsc(profile.getId());
        List<Map<String, String>> recentHistory = historyList.stream()
                .limit(20) // Limit context size
                .map(h -> Map.of("role", h.getRole(), "content", h.getMessage()))
                .collect(Collectors.toList());

        // 3. Call AI Service
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("prompt", prompt);
            payload.put("history", recentHistory);

            String aiResponseJson = aiServiceClient.chatTutor(payload);
            Map<String, Object> aiResponseMap = objectMapper.readValue(aiResponseJson, new TypeReference<Map<String, Object>>() {});
            String reply = (String) aiResponseMap.get("response");

            // 4. Save tutor message
            ChatHistory assistantMessage = ChatHistory.builder()
                    .studentProfile(profile)
                    .role("assistant")
                    .message(reply)
                    .build();
            chatHistoryRepository.save(assistantMessage);

            return ResponseEntity.ok(Map.of("response", reply));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Tutor is temporarily offline: " + e.getMessage()));
        }
    }

    @DeleteMapping("/history")
    @Transactional
    public ResponseEntity<?> clearHistory() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userOpt.get().getId());
        if (profileOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Profile not found"));
        }

        chatHistoryRepository.deleteByStudentProfileId(profileOpt.get().getId());
        return ResponseEntity.ok(Map.of("message", "Chat history cleared successfully"));
    }
}
