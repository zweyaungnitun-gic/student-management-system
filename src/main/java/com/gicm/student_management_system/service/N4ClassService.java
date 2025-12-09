package com.gicm.student_management_system.service;

import com.gicm.student_management_system.entity.N4Class;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.N4ClassRepository;
import com.gicm.student_management_system.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class N4ClassService {

    private final N4ClassRepository n4ClassRepository;
    private final StudentRepository studentRepository;

    public N4Class getOrCreateN4Class(Long studentId) {
        return n4ClassRepository.findByStudentId(studentId)
                .orElseGet(() -> {
                    // If no N5 class record exists, create a new empty one linked to the student
                    Student student = studentRepository.findById(studentId)
                            .orElseThrow(() -> new RuntimeException("Student not found"));
                    
                    N4Class newClass = N4Class.builder()
                            .student(student)
                            .build();
                    return n4ClassRepository.save(newClass);
                });
    }

    @Transactional
    public void saveN4Class(N4Class n4Class) {
        n4ClassRepository.save(n4Class);
    }
}