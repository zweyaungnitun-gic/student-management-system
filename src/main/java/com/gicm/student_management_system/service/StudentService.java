package com.gicm.student_management_system.service;

import java.util.List;
import java.util.Optional;

import com.gicm.student_management_system.dto.StudentDTO;
import com.gicm.student_management_system.entity.RegistrationStatus;
import com.gicm.student_management_system.entity.Student;

public interface StudentService {

    List<StudentDTO> getAllStudents();

    List<StudentDTO> getStudentsByFilter(String nameSearch);

    /**
     * Get students filtered by tenant (for multi-tenancy)
     * If current user is SUPER_ADMIN, returns all students
     * If current user is ADMIN, returns only students created by that admin
     */
    List<StudentDTO> getAllStudentsForCurrentUser();

    List<StudentDTO> getStudentsByFilterForCurrentUser(String nameSearch);

    StudentDTO getStudentById(Long id);

    /**
     * Check if current user can access the student
     */
    boolean canAccessStudent(Long studentId);

    StudentDTO createStudent(StudentDTO studentDTO);

    StudentDTO updateStudent(Long id, StudentDTO studentDTO);

    void deleteStudent(Long id);

    List<Student> findAll();

    Optional<Student> findById(Long id);

    List<Student> getStudentsByFilterFull(String nameSearch);

    Student save(Student student);

    List<Student> findAllByIds(List<Long> ids);

    boolean isNationalIdDuplicate(String nationalId, Long excludeId);

    List<Student> findByRegistrationStatus(RegistrationStatus status, String nameSearch);

    Optional<Student> findByStudentId(String studentId);
}