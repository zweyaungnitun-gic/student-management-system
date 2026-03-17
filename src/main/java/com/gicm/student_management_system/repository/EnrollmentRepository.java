package com.gicm.student_management_system.repository;

import com.gicm.student_management_system.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    
    // Fix: Use @Query instead of method name parsing
    @Query("SELECT e FROM Enrollment e WHERE e.student.id = :studentId")
    List<Enrollment> findByStudentId(@Param("studentId") Long studentId);
    
    // Fix: Use @Query instead of method name parsing
    @Query("SELECT e FROM Enrollment e WHERE e.course.courseId = :courseId")
    List<Enrollment> findByCourseId(@Param("courseId") Long courseId);
    
    @Query("SELECT e FROM Enrollment e WHERE e.student.id = :studentId AND e.course.courseId = :courseId")
    Optional<Enrollment> findByStudentAndCourse(@Param("studentId") Long studentId, @Param("courseId") Long courseId);
    
    @Query("SELECT e FROM Enrollment e WHERE e.course.courseId = :courseId AND e.status = 'enrolled'")
    List<Enrollment> findActiveEnrollmentsByCourse(@Param("courseId") Long courseId);
    
    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.course.courseId = :courseId AND e.status = 'enrolled'")
    Long countActiveEnrollmentsByCourse(@Param("courseId") Long courseId);
}