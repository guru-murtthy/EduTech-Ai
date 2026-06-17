package com.edutech.config;

import com.edutech.model.User;
import com.edutech.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Seed default student if not present
        if (userRepository.findByEmail("student@edutech.ai").isEmpty()) {
            User student = User.builder()
                    .email("student@edutech.ai")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .role(User.Role.STUDENT)
                    .build();
            userRepository.save(student);
            System.out.println("Seeded default student: student@edutech.ai / password123");
        }

        // Seed default admin if not present
        if (userRepository.findByEmail("admin@edutech.ai").isEmpty()) {
            User admin = User.builder()
                    .email("admin@edutech.ai")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .role(User.Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("Seeded default admin: admin@edutech.ai / password123");
        }

        // Seed default teacher if not present
        if (userRepository.findByEmail("teacher@edutech.ai").isEmpty()) {
            User teacher = User.builder()
                    .email("teacher@edutech.ai")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .role(User.Role.TEACHER)
                    .build();
            userRepository.save(teacher);
            System.out.println("Seeded default teacher: teacher@edutech.ai / password123");
        }
    }
}
