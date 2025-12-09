package com.gicm.student_management_system.service;

import com.gicm.student_management_system.dto.N4ClassDTO;
import com.gicm.student_management_system.entity.N4Class;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.N4ClassRepository;
import com.gicm.student_management_system.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class N4ClassService {

    private final N4ClassRepository n4ClassRepository;
    private final StudentRepository studentRepository;

    // --- Conversion Methods ---

    private N4ClassDTO convertToDTO(N4Class n4Class) {
        return N4ClassDTO.builder()
                .id(n4Class.getId())
                .studentId(n4Class.getStudent().getId())
                .n4ClassTeacher(n4Class.getN4ClassTeacher())
                .n4ClassAttendance(n4Class.getN4ClassAttendance())
                .n4ClassTestResult1(n4Class.getN4ClassTestResult1())
                .n4ClassTestResult2(n4Class.getN4ClassTestResult2())
                .n4ClassTestResult3(n4Class.getN4ClassTestResult3())
                .n4ClassTestResult4(n4Class.getN4ClassTestResult4())
                .n4ClassFeedback(n4Class.getN4ClassFeedback())
                .n4Class1Teacher(n4Class.getN4Class1Teacher())
                .n4Class1AttendanceRate(n4Class.getN4Class1AttendanceRate())
                .n4Class1TestResult(n4Class.getN4Class1TestResult())
                .n4Class1TeacherFeedback(n4Class.getN4Class1TeacherFeedback())
                .n4Class2Teacher(n4Class.getN4Class2Teacher())
                .n4Class2AttendanceRate(n4Class.getN4Class2AttendanceRate())
                .n4Class2TestResult(n4Class.getN4Class2TestResult())
                .n4Class2TeacherFeedback(n4Class.getN4Class2TeacherFeedback())
                .n4Class3Teacher(n4Class.getN4Class3Teacher())
                .n4Class3AttendanceRate(n4Class.getN4Class3AttendanceRate())
                .n4Class3TestResult(n4Class.getN4Class3TestResult())
                .n4Class3TeacherFeedback(n4Class.getN4Class3TeacherFeedback())
                .build();
    }

    private N4Class convertToEntity(N4ClassDTO dto, Student student) {
        // Find existing entity if ID is present, or create a new one
        N4Class n4Class = Optional.ofNullable(dto.getId())
                .flatMap(n4ClassRepository::findById)
                .orElse(new N4Class());

        // Update fields from DTO
        n4Class.setStudent(student); // Ensure the student is set/updated
        n4Class.setN4ClassTeacher(dto.getN4ClassTeacher());
        n4Class.setN4ClassAttendance(dto.getN4ClassAttendance());
        n4Class.setN4ClassTestResult1(dto.getN4ClassTestResult1());
        n4Class.setN4ClassTestResult2(dto.getN4ClassTestResult2());
        n4Class.setN4ClassTestResult3(dto.getN4ClassTestResult3());
        n4Class.setN4ClassTestResult4(dto.getN4ClassTestResult4());
        n4Class.setN4ClassFeedback(dto.getN4ClassFeedback());
        n4Class.setN4Class1Teacher(dto.getN4Class1Teacher());
        n4Class.setN4Class1AttendanceRate(dto.getN4Class1AttendanceRate());
        n4Class.setN4Class1TestResult(dto.getN4Class1TestResult());
        n4Class.setN4Class1TeacherFeedback(dto.getN4Class1TeacherFeedback());
        n4Class.setN4Class2Teacher(dto.getN4Class2Teacher());
        n4Class.setN4Class2AttendanceRate(dto.getN4Class2AttendanceRate());
        n4Class.setN4Class2TestResult(dto.getN4Class2TestResult());
        n4Class.setN4Class2TeacherFeedback(dto.getN4Class2TeacherFeedback());
        n4Class.setN4Class3Teacher(dto.getN4Class3Teacher());
        n4Class.setN4Class3AttendanceRate(dto.getN4Class3AttendanceRate());
        n4Class.setN4Class3TestResult(dto.getN4Class3TestResult());
        n4Class.setN4Class3TeacherFeedback(dto.getN4Class3TeacherFeedback());

        return n4Class;
    }

    // --- Service Methods ---

    /**
     * Gets the N4Class record for a student, or creates a new empty one and returns
     * its DTO.
     * Includes the studentId in the DTO.
     */
    public N4ClassDTO getOrCreateN4ClassDTO(Long studentId) {
        N4Class n4Class = n4ClassRepository.findByStudentId(studentId)
                .orElseGet(() -> {
                    // If no N4 class record exists, create a new empty one linked to the student
                    Student student = studentRepository.findById(studentId)
                            .orElseThrow(() -> new RuntimeException("Student not found"));

                    N4Class newClass = N4Class.builder()
                            .student(student)
                            .build();
                    return n4ClassRepository.save(newClass);
                });

        return convertToDTO(n4Class);
    }

    /**
     * Saves or updates the N4Class record using the provided DTO.
     */
    @Transactional
    public N4ClassDTO saveN4ClassDTO(Long studentId, N4ClassDTO n4ClassDTO) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + studentId));

        // Ensure the DTO is linked to the correct student (for safety, though
        // controller should handle it)
        n4ClassDTO.setStudentId(studentId);

        // Convert DTO to entity, preserving or setting the student relationship
        N4Class n4Class = convertToEntity(n4ClassDTO, student);

        N4Class savedClass = n4ClassRepository.save(n4Class);

        return convertToDTO(savedClass);
    }
}