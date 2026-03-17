package com.gicm.student_management_system.repository;

import com.gicm.student_management_system.entity.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestRepository extends JpaRepository<Test, Long> {
    
    @Query("SELECT t FROM Test t WHERE t.course.courseId = :courseId ORDER BY t.testDate DESC")
    List<Test> findByCourseId(@Param("courseId") Long courseId);

    @Query("SELECT t FROM Test t WHERE t.createdBy.teacherId = :teacherId ORDER BY t.testDate DESC")
    List<Test> findByCreatedBy(@Param("teacherId") Long teacherId);

    @Query("SELECT t FROM Test t WHERE LOWER(t.testName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.course.courseName) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Test> searchTests(@Param("search") String search);

    boolean existsByTestNameAndCourseCourseId(String testName, Long courseId);
}