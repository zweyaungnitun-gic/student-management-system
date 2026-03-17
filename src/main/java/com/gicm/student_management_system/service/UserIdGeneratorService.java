package com.gicm.student_management_system.service;

import com.gicm.student_management_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserIdGeneratorService {

    private final UserRepository userRepository;

    public String generateUserId() {
        // Format: USRXXX (e.g., USR001, USR002)
        String prefix = "USR";
        
        // Get the total count of users + 1
        long count = userRepository.count() + 1;
        String sequence = String.format("%03d", count);
        
        return prefix + sequence;
    }
}