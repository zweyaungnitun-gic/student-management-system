package com.gicm.student_management_system.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.gicm.student_management_system.repository.StudentRepository;

@Service
@RequiredArgsConstructor
public class StudentIdGeneratorService {

    private final StudentRepository studentRepository;

    public String generateStudentId() {
        // Find the highest existing student ID
        String maxStudentId = studentRepository.findMaxStudentId();

        if (maxStudentId == null || !maxStudentId.startsWith("STU")) {
            return "STU001";
        }

        try {
            // Extract numeric part from "STU001"
            String numericPart = maxStudentId.substring(3);
            int nextNumber = Integer.parseInt(numericPart) + 1;
            return String.format("STU%03d", nextNumber);
        } catch (Exception e) {
            // Fallback: use the database ID
            long nextId = studentRepository.count() + 1;
            return String.format("STU%03d", nextId);
        }
    }
}