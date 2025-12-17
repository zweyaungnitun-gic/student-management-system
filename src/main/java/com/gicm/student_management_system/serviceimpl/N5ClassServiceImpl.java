package com.gicm.student_management_system.serviceimpl;

import com.gicm.student_management_system.dto.N5ClassDTO;
import com.gicm.student_management_system.entity.N5Class;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.N5ClassRepository;
import com.gicm.student_management_system.repository.StudentRepository;
import com.gicm.student_management_system.service.N5ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class N5ClassServiceImpl implements N5ClassService {

    private final N5ClassRepository n5ClassRepository;
    private final StudentRepository studentRepository;

    // --- Converter Methods ---

    public N5ClassDTO convertToDTO(N5Class entity) {
        if (entity == null) {
            return N5ClassDTO.builder().build();
        }
        return N5ClassDTO.builder()
                .id(entity.getId())
                .studentId(entity.getStudent() != null ? entity.getStudent().getId() : null)
                .n5ClassTeacher(entity.getN5ClassTeacher())
                .n5ClassAttendance(entity.getN5ClassAttendance())
                .n5ClassTestResult1(entity.getN5ClassTestResult1())
                .n5ClassTestResult2(entity.getN5ClassTestResult2())
                .n5ClassTestResult3(entity.getN5ClassTestResult3())
                .n5ClassTestResult4(entity.getN5ClassTestResult4())
                .n5ClassFeedback(entity.getN5ClassFeedback())
                .n5Class1Teacher(entity.getN5Class1Teacher())
                .n5Class1AttendanceRate(entity.getN5Class1AttendanceRate())
                .n5Class1TestResult(entity.getN5Class1TestResult())
                .n5Class1TeacherFeedback(entity.getN5Class1TeacherFeedback())
                .n5Class2Teacher(entity.getN5Class2Teacher())
                .n5Class2AttendanceRate(entity.getN5Class2AttendanceRate())
                .n5Class2TestResult(entity.getN5Class2TestResult())
                .n5Class2TeacherFeedback(entity.getN5Class2TeacherFeedback())
                .n5Class3Teacher(entity.getN5Class3Teacher())
                .n5Class3AttendanceRate(entity.getN5Class3AttendanceRate())
                .n5Class3TestResult(entity.getN5Class3TestResult())
                .n5Class3TeacherFeedback(entity.getN5Class3TeacherFeedback())
                .build();
    }

    private void updateEntityFromDTO(N5Class entity, N5ClassDTO dto) {
        entity.setN5ClassTeacher(dto.getN5ClassTeacher());
        entity.setN5ClassAttendance(dto.getN5ClassAttendance());
        entity.setN5ClassTestResult1(dto.getN5ClassTestResult1());
        entity.setN5ClassTestResult2(dto.getN5ClassTestResult2());
        entity.setN5ClassTestResult3(dto.getN5ClassTestResult3());
        entity.setN5ClassTestResult4(dto.getN5ClassTestResult4());
        entity.setN5ClassFeedback(dto.getN5ClassFeedback());
        entity.setN5Class1Teacher(dto.getN5Class1Teacher());
        entity.setN5Class1AttendanceRate(dto.getN5Class1AttendanceRate());
        entity.setN5Class1TestResult(dto.getN5Class1TestResult());
        entity.setN5Class1TeacherFeedback(dto.getN5Class1TeacherFeedback());
        entity.setN5Class2Teacher(dto.getN5Class2Teacher());
        entity.setN5Class2AttendanceRate(dto.getN5Class2AttendanceRate());
        entity.setN5Class2TestResult(dto.getN5Class2TestResult());
        entity.setN5Class2TeacherFeedback(dto.getN5Class2TeacherFeedback());
        entity.setN5Class3Teacher(dto.getN5Class3Teacher());
        entity.setN5Class3AttendanceRate(dto.getN5Class3AttendanceRate());
        entity.setN5Class3TestResult(dto.getN5Class3TestResult());
        entity.setN5Class3TeacherFeedback(dto.getN5Class3TeacherFeedback());
    }

    // --- Service Implementation ---

    @Override
    @Transactional(readOnly = true)
    public N5ClassDTO getOrCreateN5ClassDTO(Long studentId) {
        Optional<N5Class> n5ClassOpt = n5ClassRepository.findByStudentId(studentId);

        if (n5ClassOpt.isPresent()) {
            return convertToDTO(n5ClassOpt.get());
        } else {
            // Return an empty DTO with the studentId set, so the form knows who it belongs
            // to
            return N5ClassDTO.builder()
                    .studentId(studentId)
                    .build();
        }
    }

    @Override
    @Transactional
    public void saveN5ClassDTO(Long studentId, N5ClassDTO n5ClassDTO) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        N5Class n5Class = n5ClassRepository.findByStudentId(studentId)
                .orElse(N5Class.builder().student(student).build());

        // Update fields
        updateEntityFromDTO(n5Class, n5ClassDTO);

        // Ensure relationship is set (crucial for new entities)
        n5Class.setStudent(student);

        n5ClassRepository.save(n5Class);
    }
}