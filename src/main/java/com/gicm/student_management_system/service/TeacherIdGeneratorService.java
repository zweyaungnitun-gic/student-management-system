package com.gicm.student_management_system.service;

import com.gicm.student_management_system.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TeacherIdGeneratorService {

    private final TeacherRepository teacherRepository;

    public String generateTeacherId() {
        String prefix = "TCH";
        long count = teacherRepository.count() + 1;
        String teacherCode;
        
        do {
            String sequence = String.format("%03d", count);
            teacherCode = prefix + sequence;
            count++;
        } while (teacherRepository.existsByTeacherCode(teacherCode));
        
        return teacherCode;
    }
}