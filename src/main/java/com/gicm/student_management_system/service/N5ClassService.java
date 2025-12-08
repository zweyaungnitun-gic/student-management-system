package com.gicm.student_management_system.service;

import com.gicm.student_management_system.entity.N5Class;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.N5ClassRepository;
import com.gicm.student_management_system.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class N5ClassService {

    private final N5ClassRepository n5ClassRepository;
    private final StudentRepository studentRepository;

    public N5Class getOrCreateN5Class(Long studentId) {
        return n5ClassRepository.findByStudentId(studentId)
                .orElseGet(() -> {
                    // If no N5 class record exists, create a new empty one linked to the student
                    Student student = studentRepository.findById(studentId)
                            .orElseThrow(() -> new RuntimeException("Student not found"));
                    
                    N5Class newClass = N5Class.builder()
                            .student(student)
                            .build();
                    return n5ClassRepository.save(newClass);
                });
    }

    @Transactional
    public void saveN5Class(N5Class n5Class) {
        n5ClassRepository.save(n5Class);
    }
}