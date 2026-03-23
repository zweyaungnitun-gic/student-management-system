package com.gicm.student_management_system.service;

import com.gicm.student_management_system.dto.EnrollmentDTO;
import java.util.List;
import java.util.Optional;

public interface EnrollmentService {
    List<EnrollmentDTO> getAllEnrollments();
    List<EnrollmentDTO> getEnrollmentsByStudent(Long studentId);
    List<EnrollmentDTO> getEnrollmentsByCourse(Long courseId);
    List<EnrollmentDTO> getActiveEnrollmentsByCourse(Long courseId);
    Optional<EnrollmentDTO> getEnrollmentById(Long id);
    Optional<EnrollmentDTO> getEnrollmentByStudentAndCourse(Long studentId, Long courseId);
    EnrollmentDTO createEnrollment(EnrollmentDTO enrollmentDTO);
    EnrollmentDTO updateEnrollment(Long id, EnrollmentDTO enrollmentDTO);
    void deleteEnrollment(Long id);
    Long countActiveEnrollmentsByCourse(Long courseId);
    Optional<EnrollmentDTO> getActiveEnrollmentByStudentAndCourse(Long studentId, Long courseId);
}