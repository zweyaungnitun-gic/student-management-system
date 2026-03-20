package com.gicm.student_management_system.service;

import com.gicm.student_management_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserIdGeneratorService {

    private final UserRepository userRepository;

    public String generateUserId() {
        String prefix = "USR";
        long count = 1;
        String userId;
        
        do {
            String sequence = String.format("%03d", count);
            userId = prefix + sequence;
            count++;
        } while (userRepository.existsByUserId(userId));
        
        return userId;
    }
}