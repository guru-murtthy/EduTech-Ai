package com.edutech.controller;

import com.edutech.model.ChatMessage;
import com.edutech.model.User;
import com.edutech.repository.ChatMessageRepository;
import com.edutech.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/support")
public class SupportChatController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    private static final String DEFAULT_ADMIN_EMAIL = "admin@edutech.ai";

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@RequestParam(value = "with", required = false) String withEmail) {
        String currentUserEmail = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<User> userOpt = userRepository.findByEmail(currentUserEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        if (user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.TEACHER) {
            if (withEmail == null || withEmail.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Must specify 'with' student email"));
            }
            List<ChatMessage> history = chatMessageRepository.findChatHistory(currentUserEmail, withEmail);
            return ResponseEntity.ok(history);
        } else {
            // Student history is always with the default admin or actual admin email
            List<ChatMessage> history = chatMessageRepository.findChatHistory(currentUserEmail, DEFAULT_ADMIN_EMAIL);
            return ResponseEntity.ok(history);
        }
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, String> request) {
        String currentUserEmail = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String receiverEmail = request.get("receiverEmail");
        String messageText = request.get("message");

        if (messageText == null || messageText.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Message cannot be empty"));
        }

        Optional<User> userOpt = userRepository.findByEmail(currentUserEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        if (user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.TEACHER) {
            if (receiverEmail == null || receiverEmail.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Receiver email must be specified for admins"));
            }
        } else {
            // Student messages are always sent to the admin
            receiverEmail = DEFAULT_ADMIN_EMAIL;
        }

        ChatMessage chatMessage = new ChatMessage(currentUserEmail, receiverEmail, messageText);
        chatMessageRepository.save(chatMessage);
        return ResponseEntity.ok(chatMessage);
    }

    @GetMapping("/contacts")
    public ResponseEntity<?> getContacts() {
        String currentUserEmail = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<User> userOpt = userRepository.findByEmail(currentUserEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        if (user.getRole() != User.Role.ADMIN && user.getRole() != User.Role.TEACHER) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }

        // Return a list of students who have sent messages to this admin
        List<String> contactEmails = chatMessageRepository.findContactsForAdmin(currentUserEmail);
        
        // Also fetch names of these students if they have profiles
        List<Map<String, String>> contacts = new ArrayList<>();
        for (String email : contactEmails) {
            String name = email.split("@")[0]; // Fallback name
            contacts.add(Map.of("email", email, "name", name));
        }

        return ResponseEntity.ok(contacts);
    }
}
