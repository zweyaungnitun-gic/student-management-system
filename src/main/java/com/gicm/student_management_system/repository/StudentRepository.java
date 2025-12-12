package com.gicm.student_management_system.repository;

import com.gicm.student_management_system.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Collection; // <-- You may need this import if not already present

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
   
    List<Student> findByStudentNameContainingAndStatus(String studentName, String status);

    List<Student> findByStudentNameContaining(String studentName);

    List<Student> findByStatus(String status);
    
    // --- ADD THESE TWO LINES TO FIX THE COMPILATION ERROR ---

    /**
     * Finds students whose name contains the search term AND whose status is in the given list.
     */
    List<Student> findByStudentNameContainingAndStatusIn(String studentName, Collection<String> statuses);

    /**
     * Finds students whose status is in the given list.
     */
    List<Student> findByStatusIn(Collection<String> statuses);
}