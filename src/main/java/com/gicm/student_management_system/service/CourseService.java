package com.gicm.student_management_system.service;

import com.gicm.student_management_system.dto.CourseDTO;

import java.util.List;
import java.util.Optional;

public interface CourseService {
    List<CourseDTO> getAllCourses();
    List<CourseDTO> getActiveCourses();
    Optional<CourseDTO> getCourseById(Long id);
    Optional<CourseDTO> getCourseByCode(String courseCode);
    CourseDTO createCourse(CourseDTO courseDTO);
    CourseDTO updateCourse(Long id, CourseDTO courseDTO);
    void deleteCourse(Long id);
    void toggleCourseActive(Long id);
    List<CourseDTO> getCoursesByTeacher(Long teacherId);
    List<CourseDTO> searchCourses(String search);
    boolean existsByCourseCode(String courseCode);
}