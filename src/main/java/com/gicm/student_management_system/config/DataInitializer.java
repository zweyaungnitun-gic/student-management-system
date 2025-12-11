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

        // Initialize Admin User
        if (!userRepository.existsByEmail("admin@gmail.com")) {
            User admin = User.builder()
                    .username("Admin")
                    .email("admin@gmail.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("✓ Admin user created successfully");
            log.info("  Email: admin@gmail.com");
            log.info("  Password: admin123");
            log.info("  Role: ADMIN");
        } else {
            log.info("✓ Admin user already exists");
        }

        log.info("----------------------------------------");

        // Initialize Guest User
        if (!userRepository.existsByEmail("guest@gmail.com")) {
            User guest = User.builder()
                    .username("Guest")
                    .email("guest@gmail.com")
                    .password(passwordEncoder.encode("guest123"))
                    .role(Role.GUEST)
                    .build();
            userRepository.save(guest);
            log.info("✓ Guest user created successfully");
            log.info("  Email: guest@gmail.com");
            log.info("  Password: guest123");
            log.info("  Role: GUEST");
        } else {
            log.info("✓ Guest user already exists");
        }

        log.info("========================================");
        log.info("Data Initialization Completed!");
        log.info("========================================");
    }
}
