package com.gicm.student_management_system.repository;

import com.gicm.student_management_system.entity.Course;
import com.gicm.student_management_system.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCourseCode(String courseCode);
    boolean existsByCourseCode(String courseCode);
    List<Course> findByTeacher(Teacher teacher);
    List<Course> findByIsActiveTrue();
    List<Course> findByCourseNameContainingIgnoreCaseOrCourseCodeContainingIgnoreCase(String courseName, String courseCode);
}