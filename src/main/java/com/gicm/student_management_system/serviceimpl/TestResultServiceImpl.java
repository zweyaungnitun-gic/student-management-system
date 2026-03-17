package com.gicm.student_management_system.serviceimpl;

import com.gicm.student_management_system.dto.TestResultDTO;
import com.gicm.student_management_system.entity.TestResult;
import com.gicm.student_management_system.entity.Test;
import com.gicm.student_management_system.entity.Enrollment;
import com.gicm.student_management_system.entity.Teacher;
import com.gicm.student_management_system.repository.TestResultRepository;
import com.gicm.student_management_system.repository.TestRepository;
import com.gicm.student_management_system.repository.EnrollmentRepository;
import com.gicm.student_management_system.repository.TeacherRepository;
import com.gicm.student_management_system.service.TestResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestResultServiceImpl implements TestResultService {

    private final TestResultRepository testResultRepository;
    private final TestRepository testRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final TeacherRepository teacherRepository;

    private TestResultDTO convertToDTO(TestResult result) {
        if (result == null) return null;

        String resultStatus = "不合格";
        if (result.getScoreObtained() != null && result.getTest() != null && 
            result.getTest().getPassingMarks() != null) {
            resultStatus = result.getScoreObtained().compareTo(
                BigDecimal.valueOf(result.getTest().getPassingMarks())) >= 0 ? "合格" : "不合格";
        }

        return TestResultDTO.builder()
                .testResultId(result.getTestResultId())
                .testId(result.getTest() != null ? result.getTest().getTestId() : null)
                .testName(result.getTest() != null ? result.getTest().getTestName() : null)
                .enrollmentId(result.getEnrollment() != null ? result.getEnrollment().getEnrollmentId() : null)
                .studentName(result.getEnrollment() != null && result.getEnrollment().getStudent() != null ? 
                        result.getEnrollment().getStudent().getStudentName() : null)
                .studentId(result.getEnrollment() != null && result.getEnrollment().getStudent() != null ? 
                        result.getEnrollment().getStudent().getStudentId() : null)
                .courseName(result.getTest() != null && result.getTest().getCourse() != null ? 
                        result.getTest().getCourse().getCourseName() : null)
                .scoreObtained(result.getScoreObtained())
                .totalMarks(result.getTest() != null ? result.getTest().getTotalMarks() : null)
                .passingMarks(result.getTest() != null ? result.getTest().getPassingMarks() : null)
                .result(resultStatus)
                .teacherFeedback(result.getTeacherFeedback())
                .gradedById(result.getGradedBy() != null ? result.getGradedBy().getTeacherId() : null)
                .gradedByName(result.getGradedBy() != null ? result.getGradedBy().getName() : null)
                .gradedAt(result.getGradedAt())
                .submittedAt(result.getSubmittedAt())
                .build();
    }

    private TestResult convertToEntity(TestResultDTO dto) {
        return convertToEntity(dto, null);
    }

    private TestResult convertToEntity(TestResultDTO dto, TestResult existing) {
        TestResult result = (existing != null) ? existing : new TestResult();

        if (dto.getScoreObtained() != null) result.setScoreObtained(dto.getScoreObtained());
        if (dto.getTeacherFeedback() != null) result.setTeacherFeedback(dto.getTeacherFeedback());

        if (dto.getTestId() != null) {
            Test test = testRepository.findById(dto.getTestId())
                    .orElseThrow(() -> new RuntimeException("テストが見つかりません: " + dto.getTestId()));
            result.setTest(test);
        }

        if (dto.getEnrollmentId() != null) {
            Enrollment enrollment = enrollmentRepository.findById(dto.getEnrollmentId())
                    .orElseThrow(() -> new RuntimeException("受講登録が見つかりません: " + dto.getEnrollmentId()));
            result.setEnrollment(enrollment);
        }

        if (dto.getGradedById() != null) {
            Teacher teacher = teacherRepository.findById(dto.getGradedById())
                    .orElseThrow(() -> new RuntimeException("教師が見つかりません: " + dto.getGradedById()));
            result.setGradedBy(teacher);
        }

        if (existing == null) {
            result.setSubmittedAt(LocalDateTime.now());
        }
        result.setGradedAt(LocalDateTime.now());

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TestResultDTO> getResultsByTest(Long testId) {
        return testResultRepository.findByTestId(testId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TestResultDTO> getResultsByStudent(Long studentId) {
        return testResultRepository.findByStudentId(studentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TestResultDTO> getResultsByEnrollment(Long enrollmentId) {
        return testResultRepository.findByEnrollmentId(enrollmentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TestResultDTO> getResultById(Long id) {
        return testResultRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TestResultDTO> getResultByTestAndEnrollment(Long testId, Long enrollmentId) {
        return testResultRepository.findByTestAndEnrollment(testId, enrollmentId)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional
    public TestResultDTO addOrUpdateResult(TestResultDTO resultDTO) {
        Optional<TestResult> existing = testResultRepository.findByTestAndEnrollment(
                resultDTO.getTestId(), resultDTO.getEnrollmentId());

        TestResult result;
        if (existing.isPresent()) {
            result = convertToEntity(resultDTO, existing.get());
        } else {
            result = convertToEntity(resultDTO);
        }

        TestResult saved = testResultRepository.save(result);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public void deleteResult(Long id) {
        if (!testResultRepository.existsById(id)) {
            throw new RuntimeException("テスト結果が見つかりません: " + id);
        }
        testResultRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getTestStatistics(Long testId) {
        Map<String, Object> stats = new HashMap<>();
        
        List<TestResult> results = testResultRepository.findByTestId(testId);
        Test test = testRepository.findById(testId).orElse(null);

        if (test == null) {
            return stats;
        }

        stats.put("totalStudents", results.size());
        stats.put("totalMarks", test.getTotalMarks());
        stats.put("passingMarks", test.getPassingMarks());

        if (!results.isEmpty()) {
            Double avgScore = testResultRepository.getAverageScoreForTest(testId);
            Long passedCount = testResultRepository.countPassedStudents(testId);
            
            stats.put("averageScore", avgScore != null ? Math.round(avgScore * 100.0) / 100.0 : 0);
            stats.put("passedCount", passedCount);
            stats.put("failedCount", results.size() - passedCount);
            stats.put("passRate", results.size() > 0 ? 
                    Math.round((passedCount * 100.0 / results.size()) * 100.0) / 100.0 : 0);

            // Calculate highest and lowest scores
            Optional<BigDecimal> highest = results.stream()
                    .map(TestResult::getScoreObtained)
                    .filter(Objects::nonNull)
                    .max(BigDecimal::compareTo);
            Optional<BigDecimal> lowest = results.stream()
                    .map(TestResult::getScoreObtained)
                    .filter(Objects::nonNull)
                    .min(BigDecimal::compareTo);

            stats.put("highestScore", highest.orElse(BigDecimal.ZERO));
            stats.put("lowestScore", lowest.orElse(BigDecimal.ZERO));
            
            // Score distribution
            long passed = results.stream()
                    .filter(r -> r.getScoreObtained() != null && 
                           r.getScoreObtained().compareTo(BigDecimal.valueOf(test.getPassingMarks())) >= 0)
                    .count();
            long failed = results.size() - passed;
            
            stats.put("passedCount", passed);
            stats.put("failedCount", failed);
        }

        return stats;
    }

    @Override
    @Transactional
    public List<TestResultDTO> addBulkResults(List<TestResultDTO> resultDTOs) {
        return resultDTOs.stream()
                .map(this::addOrUpdateResult)
                .collect(Collectors.toList());
    }
}