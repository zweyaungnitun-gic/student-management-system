package com.gicm.student_management_system.serviceimpl;

import com.gicm.student_management_system.dto.EnrollmentDTO;
import com.gicm.student_management_system.entity.Enrollment;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.entity.Course;
import com.gicm.student_management_system.repository.EnrollmentRepository;
import com.gicm.student_management_system.repository.StudentRepository;
import com.gicm.student_management_system.repository.CourseRepository;
import com.gicm.student_management_system.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    private EnrollmentDTO convertToDTO(Enrollment enrollment) {
        if (enrollment == null) return null;
        return EnrollmentDTO.builder()
                .enrollmentId(enrollment.getEnrollmentId())
                .studentId(enrollment.getStudent() != null ? enrollment.getStudent().getId() : null)
                .studentName(enrollment.getStudent() != null ? enrollment.getStudent().getStudentName() : null)
                .studentIdNumber(enrollment.getStudent() != null ? enrollment.getStudent().getStudentId() : null)
                .courseId(enrollment.getCourse() != null ? enrollment.getCourse().getCourseId() : null)
                .courseName(enrollment.getCourse() != null ? enrollment.getCourse().getCourseName() : null)
                .courseCode(enrollment.getCourse() != null ? enrollment.getCourse().getCourseCode() : null)
                .semester(enrollment.getSemester())
                .status(enrollment.getStatus())
                .initiatedBy(enrollment.getInitiatedBy())
                .enrollmentRequestDate(enrollment.getEnrollmentRequestDate())
                .approvedAt(enrollment.getApprovedAt())
                .completedAt(enrollment.getCompletedAt())
                .enrolledDate(enrollment.getEnrollmentRequestDate())
                .build();
    }

    private Enrollment convertToEntity(EnrollmentDTO dto) {
        return convertToEntity(dto, null);
    }

    private Enrollment convertToEntity(EnrollmentDTO dto, Enrollment existing) {
        Enrollment enrollment = (existing != null) ? existing : new Enrollment();

        if (dto.getSemester() != null) enrollment.setSemester(dto.getSemester());
        if (dto.getStatus() != null) enrollment.setStatus(dto.getStatus());
        if (dto.getInitiatedBy() != null) enrollment.setInitiatedBy(dto.getInitiatedBy());

        if (dto.getStudentId() != null) {
            Student student = studentRepository.findById(dto.getStudentId())
                    .orElseThrow(() -> new RuntimeException("生徒が見つかりません: " + dto.getStudentId()));
            enrollment.setStudent(student);
        }

        if (dto.getCourseId() != null) {
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new RuntimeException("コースが見つかりません: " + dto.getCourseId()));
            enrollment.setCourse(course);
        }

        if (existing == null) {
            enrollment.setEnrollmentRequestDate(LocalDateTime.now());
            enrollment.setStatus("pending");
        }

        return enrollment;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getAllEnrollments() {
        return enrollmentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getEnrollmentsByStudent(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getEnrollmentsByCourse(Long courseId) {
        return enrollmentRepository.findByCourseId(courseId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getActiveEnrollmentsByCourse(Long courseId) {
        return enrollmentRepository.findActiveEnrollmentsByCourse(courseId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<EnrollmentDTO> getEnrollmentById(Long id) {
        return enrollmentRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<EnrollmentDTO> getEnrollmentByStudentAndCourse(Long studentId, Long courseId) {
        return enrollmentRepository.findByStudentAndCourse(studentId, courseId)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional
    public EnrollmentDTO createEnrollment(EnrollmentDTO enrollmentDTO) {
        Enrollment enrollment = convertToEntity(enrollmentDTO);
        Enrollment saved = enrollmentRepository.save(enrollment);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public EnrollmentDTO updateEnrollment(Long id, EnrollmentDTO enrollmentDTO) {
        Enrollment existing = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("受講登録が見つかりません: " + id));
        
        Enrollment updated = convertToEntity(enrollmentDTO, existing);
        Enrollment saved = enrollmentRepository.save(updated);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public void deleteEnrollment(Long id) {
        if (!enrollmentRepository.existsById(id)) {
            throw new RuntimeException("受講登録が見つかりません: " + id);
        }
        enrollmentRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countActiveEnrollmentsByCourse(Long courseId) {
        return enrollmentRepository.countActiveEnrollmentsByCourse(courseId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<EnrollmentDTO> getActiveEnrollmentByStudentAndCourse(Long studentId, Long courseId) {
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId)
            .stream()
            .filter(e -> e.getCourse().getCourseId().equals(courseId))
            .filter(e -> "enrolled".equals(e.getStatus()) || "pending".equals(e.getStatus()))
            .sorted((e1, e2) -> e2.getEnrollmentRequestDate().compareTo(e1.getEnrollmentRequestDate()))
            .collect(Collectors.toList());
        
        if (enrollments.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(convertToDTO(enrollments.get(0)));
    }
}