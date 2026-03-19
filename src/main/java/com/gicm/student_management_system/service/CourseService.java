package com.gicm.student_management_system.service;

import com.gicm.student_management_system.dto.CourseDTO;
import com.gicm.student_management_system.dto.EnrollmentDTO;
import com.gicm.student_management_system.dto.TestDTO;

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
    List<EnrollmentDTO> getEnrollmentsByCourseId(Long id);  
    List<TestDTO> getTestsByCourseId(Long id);              
    Double getAverageScoreByCourseId(Long id);              
}