package com.gicm.student_management_system.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.gicm.student_management_system.entity.Role;
import com.gicm.student_management_system.entity.User;
import com.gicm.student_management_system.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("========================================");
        log.info("Starting Data Initialization...");
        log.info("========================================");

        // Initialize Demo Admin Users (idempotent by email)
        ensureUser("admin@gmail.com", "Admin", Role.ADMIN, "admin123");
        ensureUser("admin1@gmail.com", "Admin One", Role.ADMIN, "admin123");
        ensureUser("admin2@gmail.com", "Admin Two", Role.ADMIN, "admin123");

        log.info("----------------------------------------");

        // Initialize Guest User
        ensureUser("guest@gmail.com", "Guest", Role.GUEST, "guest123");

        log.info("========================================");
        log.info("Data Initialization Completed!");
        log.info("========================================");
    }

    private void ensureUser(String email, String username, Role role, String rawPassword) {
        if (userRepository.existsByEmail(email)) {
            log.info("✓ User already exists: {}", email);
            return;
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .build();
        userRepository.save(user);

        log.info("✓ User created successfully");
        log.info("  Email: {}", email);
        log.info("  Password: {}", rawPassword);
        log.info("  Role: {}", role.name());
    }
}
