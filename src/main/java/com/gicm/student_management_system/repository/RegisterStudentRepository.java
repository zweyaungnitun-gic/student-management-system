package com.gicm.student_management_system.repository;

import com.gicm.student_management_system.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RegisterStudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByStudentId(String studentId);
    Optional<Student> findByNationalId(String nationalId);
    boolean existsByStudentId(String studentId);
    boolean existsByNationalId(String nationalId);
}
