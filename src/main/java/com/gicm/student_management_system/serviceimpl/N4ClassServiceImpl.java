package com.gicm.student_management_system.serviceimpl;

import com.gicm.student_management_system.dto.N4ClassDTO;
import com.gicm.student_management_system.entity.N4Class;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.N4ClassRepository;
import com.gicm.student_management_system.repository.StudentRepository;
import com.gicm.student_management_system.service.N4ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class N4ClassServiceImpl implements N4ClassService {

    private final N4ClassRepository n4ClassRepository;
    private final StudentRepository studentRepository;

    // --- Converter Methods ---

    private N4ClassDTO convertToDTO(N4Class entity) {
        if (entity == null) {
            return N4ClassDTO.builder().build();
        }
        return N4ClassDTO.builder()
                .id(entity.getId())
                .studentId(entity.getStudent() != null ? entity.getStudent().getId() : null)
                .n4ClassTeacher(entity.getN4ClassTeacher())
                .n4ClassAttendance(entity.getN4ClassAttendance())
                .n4ClassTestResult1(entity.getN4ClassTestResult1())
                .n4ClassTestResult2(entity.getN4ClassTestResult2())
                .n4ClassTestResult3(entity.getN4ClassTestResult3())
                .n4ClassTestResult4(entity.getN4ClassTestResult4())
                .n4ClassFeedback(entity.getN4ClassFeedback())
                .n4Class1Teacher(entity.getN4Class1Teacher())
                .n4Class1AttendanceRate(entity.getN4Class1AttendanceRate())
                .n4Class1TestResult(entity.getN4Class1TestResult())
                .n4Class1TeacherFeedback(entity.getN4Class1TeacherFeedback())
                .n4Class2Teacher(entity.getN4Class2Teacher())
                .n4Class2AttendanceRate(entity.getN4Class2AttendanceRate())
                .n4Class2TestResult(entity.getN4Class2TestResult())
                .n4Class2TeacherFeedback(entity.getN4Class2TeacherFeedback())
                .n4Class3Teacher(entity.getN4Class3Teacher())
                .n4Class3AttendanceRate(entity.getN4Class3AttendanceRate())
                .n4Class3TestResult(entity.getN4Class3TestResult())
                .n4Class3TeacherFeedback(entity.getN4Class3TeacherFeedback())
                .build();
    }

    private void updateEntityFromDTO(N4Class entity, N4ClassDTO dto) {
        entity.setN4ClassTeacher(dto.getN4ClassTeacher());
        entity.setN4ClassAttendance(dto.getN4ClassAttendance());
        entity.setN4ClassTestResult1(dto.getN4ClassTestResult1());
        entity.setN4ClassTestResult2(dto.getN4ClassTestResult2());
        entity.setN4ClassTestResult3(dto.getN4ClassTestResult3());
        entity.setN4ClassTestResult4(dto.getN4ClassTestResult4());
        entity.setN4ClassFeedback(dto.getN4ClassFeedback());
        entity.setN4Class1Teacher(dto.getN4Class1Teacher());
        entity.setN4Class1AttendanceRate(dto.getN4Class1AttendanceRate());
        entity.setN4Class1TestResult(dto.getN4Class1TestResult());
        entity.setN4Class1TeacherFeedback(dto.getN4Class1TeacherFeedback());
        entity.setN4Class2Teacher(dto.getN4Class2Teacher());
        entity.setN4Class2AttendanceRate(dto.getN4Class2AttendanceRate());
        entity.setN4Class2TestResult(dto.getN4Class2TestResult());
        entity.setN4Class2TeacherFeedback(dto.getN4Class2TeacherFeedback());
        entity.setN4Class3Teacher(dto.getN4Class3Teacher());
        entity.setN4Class3AttendanceRate(dto.getN4Class3AttendanceRate());
        entity.setN4Class3TestResult(dto.getN4Class3TestResult());
        entity.setN4Class3TeacherFeedback(dto.getN4Class3TeacherFeedback());
    }

    // --- Service Implementation ---

    @Override
    @Transactional(readOnly = true)
    public N4ClassDTO getOrCreateN4ClassDTO(Long studentId) {
        Optional<N4Class> n4ClassOpt = n4ClassRepository.findByStudentId(studentId);

        if (n4ClassOpt.isPresent()) {
            return convertToDTO(n4ClassOpt.get());
        } else {
            return N4ClassDTO.builder()
                    .studentId(studentId)
                    .build();
        }
    }

    @Override
    @Transactional
    public void saveN4ClassDTO(Long studentId, N4ClassDTO n4ClassDTO) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        N4Class n4Class = n4ClassRepository.findByStudentId(studentId)
                .orElse(N4Class.builder().student(student).build());

        // Update fields
        updateEntityFromDTO(n4Class, n4ClassDTO);

        // Ensure relationship is set
        n4Class.setStudent(student);

        n4ClassRepository.save(n4Class);
    }
}