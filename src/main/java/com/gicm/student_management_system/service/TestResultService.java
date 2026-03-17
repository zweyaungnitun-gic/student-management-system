package com.gicm.student_management_system.service;

import com.gicm.student_management_system.dto.TestResultDTO;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface TestResultService {
    List<TestResultDTO> getResultsByTest(Long testId);
    List<TestResultDTO> getResultsByStudent(Long studentId);
    List<TestResultDTO> getResultsByEnrollment(Long enrollmentId);
    Optional<TestResultDTO> getResultById(Long id);
    Optional<TestResultDTO> getResultByTestAndEnrollment(Long testId, Long enrollmentId);
    TestResultDTO addOrUpdateResult(TestResultDTO resultDTO);
    void deleteResult(Long id);
    Map<String, Object> getTestStatistics(Long testId);
    List<TestResultDTO> addBulkResults(List<TestResultDTO> resultDTOs);
}