package com.gicm.student_management_system.service;

import com.gicm.student_management_system.dto.TestDTO;
import java.util.List;
import java.util.Optional;

public interface TestService {
    List<TestDTO> getAllTests();
    List<TestDTO> getTestsByCourse(Long courseId);
    List<TestDTO> getTestsByTeacher(Long teacherId);
    Optional<TestDTO> getTestById(Long id);
    TestDTO createTest(TestDTO testDTO);
    TestDTO updateTest(Long id, TestDTO testDTO);
    void deleteTest(Long id);
    List<TestDTO> searchTests(String search);
    boolean existsByTestNameAndCourse(String testName, Long courseId);
}