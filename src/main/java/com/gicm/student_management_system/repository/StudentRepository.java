package com.gicm.student_management_system.repository;

import com.gicm.student_management_system.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Collection;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    // Case-insensitive search by name + exact status
    List<Student> findByStudentNameIgnoreCaseContainingAndStatus(String studentName, String status);

    // Case-insensitive search by name only
    List<Student> findByStudentNameIgnoreCaseContaining(String studentName);

    // Search by status only
    List<Student> findByStatus(String status);

    // Case-insensitive search by name + status in multiple statuses
    List<Student> findByStudentNameIgnoreCaseContainingAndStatusIn(String studentName, Collection<String> statuses);

    // Search by status in multiple statuses
    List<Student> findByStatusIn(Collection<String> statuses);

    Student findTopByOrderByIdDesc();

    @Query("SELECT MAX(s.studentId) FROM Student s WHERE s.studentId LIKE 'STU%'")
    String findMaxStudentId();

    Optional<Student> findByStudentId(String studentId);
}