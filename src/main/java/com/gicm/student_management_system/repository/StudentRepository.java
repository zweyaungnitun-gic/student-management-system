package com.gicm.student_management_system.repository;

import com.gicm.student_management_system.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

   
    List<Student> findByStudentNameContainingAndStatus(String studentName, String status);

    List<Student> findByStudentNameContaining(String studentName);

    List<Student> findByStatus(String status);
}
