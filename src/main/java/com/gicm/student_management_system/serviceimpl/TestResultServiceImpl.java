package com.gicm.student_management_system.serviceimpl;

import com.gicm.student_management_system.dto.GradeCalculationDTO;
import com.gicm.student_management_system.dto.ReportCardDTO;
import com.gicm.student_management_system.dto.TestResultDTO;
import com.gicm.student_management_system.entity.*;
import com.gicm.student_management_system.repository.*;
import com.gicm.student_management_system.service.GradeCalculationService;
import com.gicm.student_management_system.service.TestResultService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TestResultServiceImpl implements TestResultService {

    private final TestResultRepository testResultRepository;
    private final TestRepository testRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final TeacherRepository teacherRepository;
    private final AdditionalStudentInfoRepository additionalStudentInfoRepository;
    private final GradeCalculationService gradeCalculationService;

    private TestResultDTO convertToDTO(TestResult result) {
        if (result == null) {
            log.warn("TestResult is null");
            return null;
        }
        
        try {
            // Safely get test data
            Test test = result.getTest();
            if (test == null) {
                log.warn("Test is null for test result ID: {}", result.getTestResultId());
                return null;
            }
            
            Course course = test.getCourse();
            if (course == null) {
                log.warn("Course is null for test ID: {}", test.getTestId());
                return null;
            }
            
            Enrollment enrollment = result.getEnrollment();
            if (enrollment == null) {
                log.warn("Enrollment is null for test result ID: {}", result.getTestResultId());
                return null;
            }
            
            Student student = enrollment.getStudent();
            if (student == null) {
                log.warn("Student is null for enrollment ID: {}", enrollment.getEnrollmentId());
                return null;
            }
            
            // Calculate result status
            String resultStatus = "不合格";
            if (result.getScoreObtained() != null && test.getPassingMarks() != null) {
                resultStatus = result.getScoreObtained().compareTo(
                    BigDecimal.valueOf(test.getPassingMarks())) >= 0 ? "合格" : "不合格";
            }
            
            // Calculate percentage if not already set
            Double percentage = result.getPercentage();
            if (percentage == null && result.getScoreObtained() != null && test.getTotalMarks() != null) {
                percentage = (result.getScoreObtained().doubleValue() / test.getTotalMarks()) * 100;
            }
            
            // Get grade from entity if set, otherwise calculate
            String grade = result.getGrade();
            if (grade == null && percentage != null) {
                if (percentage >= 90) grade = "A+";
                else if (percentage >= 80) grade = "A";
                else if (percentage >= 75) grade = "B+";
                else if (percentage >= 70) grade = "B";
                else if (percentage >= 65) grade = "C+";
                else if (percentage >= 60) grade = "C";
                else if (percentage >= 55) grade = "D+";
                else if (percentage >= 50) grade = "D";
                else grade = "F";
            }
            
            // Get GPA from entity if set, otherwise calculate
            BigDecimal gpa = result.getGpa();
            if (gpa == null && percentage != null) {
                if (percentage >= 80) gpa = BigDecimal.valueOf(4.0);
                else if (percentage >= 75) gpa = BigDecimal.valueOf(3.5);
                else if (percentage >= 70) gpa = BigDecimal.valueOf(3.0);
                else if (percentage >= 65) gpa = BigDecimal.valueOf(2.5);
                else if (percentage >= 60) gpa = BigDecimal.valueOf(2.0);
                else if (percentage >= 55) gpa = BigDecimal.valueOf(1.5);
                else if (percentage >= 50) gpa = BigDecimal.valueOf(1.0);
                else gpa = BigDecimal.valueOf(0.0);
            }
            
            return TestResultDTO.builder()
                .testResultId(result.getTestResultId())
                .testId(test.getTestId())
                .testName(test.getTestName())
                .enrollmentId(enrollment.getEnrollmentId())
                .studentName(student.getStudentName())
                .studentIdNumber(student.getStudentId())
                .studentId(student.getId())
                .courseName(course.getCourseName())
                .courseCode(course.getCourseCode())
                .scoreObtained(result.getScoreObtained())
                .totalMarks(test.getTotalMarks())
                .passingMarks(test.getPassingMarks())
                .percentage(percentage)
                .grade(grade)
                .gpa(gpa)
                .result(resultStatus)
                .teacherFeedback(result.getTeacherFeedback())
                .gradedById(result.getGradedBy() != null ? result.getGradedBy().getTeacherId() : null)
                .gradedByName(result.getGradedBy() != null ? result.getGradedBy().getName() : null)
                .gradedAt(result.getGradedAt())
                .submittedAt(result.getSubmittedAt())
                .rankInClass(null)
                .classAverage(null)
                .highestScore(null)
                .lowestScore(null)
                .build();
                    
        } catch (Exception e) {
            log.error("Error converting TestResult to DTO for ID: {}", result.getTestResultId(), e);
            return null;
        }
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

    //  REPORT CARD METHODS 
    @Override
    @Transactional(readOnly = true)
    public GradeCalculationDTO getStudentGradeSummary(Long studentId, String academicYear, String semester) {
        log.info("Getting grade summary for student ID: {}, Academic Year: {}, Semester: {}", 
                 studentId, academicYear, semester);
        return gradeCalculationService.calculateStudentGPA(studentId, academicYear, semester);
    }

    @Override
    @Transactional
    public ReportCardDTO generateStudentReportCard(Long studentId, String academicYear, String semester) {
        log.info("Generating report card for student ID: {}, Academic Year: {}, Semester: {}", 
                 studentId, academicYear, semester);
        return gradeCalculationService.generateReportCard(studentId, academicYear, semester);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getClassRankings(String className, String academicYear, String semester) {
        log.info("Getting class rankings for class: {}, Academic Year: {}, Semester: {}", 
                className, academicYear, semester);
        
        Map<String, Object> rankings = new HashMap<>();
        
        List<Student> students = additionalStudentInfoRepository.findByAttendingClassRelatedStatus(className).stream()
            .map(AdditionalStudentInfo::getCommonStudent)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
        
        if (students.isEmpty()) {
            rankings.put("className", className);
            rankings.put("academicYear", academicYear);
            rankings.put("semester", semester);
            rankings.put("totalStudents", 0);
            rankings.put("averageGpa", "0.00");
            rankings.put("highestGpa", "0.00");
            rankings.put("lowestGpa", "0.00");
            rankings.put("rankings", new ArrayList<>());
            return rankings;
        }
        
        List<GradeCalculationDTO> studentGPAs = new ArrayList<>();
        for (Student s : students) {
            try {
                GradeCalculationDTO gpa = gradeCalculationService.calculateStudentGPA(s.getId(), academicYear, semester);
                if (gpa != null) {
                    studentGPAs.add(gpa);
                }
            } catch (Exception e) {
                log.error("Error calculating GPA for student {}: {}", s.getId(), e.getMessage());
            }
        }
        
        studentGPAs.sort((a, b) -> b.getOverallGPA().compareTo(a.getOverallGPA()));

        double avgGpa = studentGPAs.stream()
            .mapToDouble(g -> g.getOverallGPA().doubleValue())
            .average()
            .orElse(0.0);
        
        BigDecimal highestGpa = studentGPAs.isEmpty() ? BigDecimal.ZERO : studentGPAs.get(0).getOverallGPA();
        BigDecimal lowestGpa = studentGPAs.isEmpty() ? BigDecimal.ZERO : 
                            studentGPAs.get(studentGPAs.size() - 1).getOverallGPA();

        rankings.put("className", className);
        rankings.put("academicYear", academicYear);
        rankings.put("semester", semester);
        rankings.put("totalStudents", students.size());
        rankings.put("averageGpa", String.format("%.2f", avgGpa));
        rankings.put("highestGpa", highestGpa);
        rankings.put("lowestGpa", lowestGpa);
        rankings.put("rankings", studentGPAs);
        
        return rankings;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReportCardDTO> getStudentReportCards(Long studentId) {
        log.info("Getting report cards for student ID: {}", studentId);
        return new ArrayList<>();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TestResultDTO> getAllResults() {
        log.debug("Fetching all test results");
        List<TestResultDTO> results = testResultRepository.findAll(Sort.by(Sort.Direction.DESC, "submittedAt"))
                .stream()
                .map(this::convertToDTO)
                .filter(Objects::nonNull) 
                .collect(Collectors.toList());
        
        log.debug("Found {} valid test results", results.size());
        return results;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TestResultDTO> getResultsByCourse(Long courseId) {
        log.debug("Fetching results for course ID: {}", courseId);
        
        List<Test> courseTests = testRepository.findByCourseId(courseId);
        
        if (courseTests.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<TestResult> allResults = new ArrayList<>();
        for (Test test : courseTests) {
            allResults.addAll(testResultRepository.findByTestId(test.getTestId()));
        }
        
        allResults.sort((a, b) -> b.getSubmittedAt().compareTo(a.getSubmittedAt()));
        
        return allResults.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get paginated results 
    @Transactional(readOnly = true)
    public Page<TestResultDTO> getResultsPaginated(int page, int size) {
        log.debug("Fetching results page: {}, size: {}", page, size);
        PageRequest pageRequest = PageRequest.of(page - 1, size, Sort.by("submittedAt").descending());
        return testResultRepository.findAll(pageRequest)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public List<TestResultDTO> getResultsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        log.debug("Fetching results between {} and {}", startDate, endDate);

        return getAllResults().stream()
                .filter(r -> r.getSubmittedAt() != null && 
                       r.getSubmittedAt().isAfter(startDate) && 
                       r.getSubmittedAt().isBefore(endDate))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TestResultDTO> getTopPerformingStudents(int limit) {
        log.debug("Fetching top {} performing students", limit);
        return getAllResults().stream()
                .sorted((a, b) -> {
                    if (a.getPercentage() == null || b.getPercentage() == null) return 0;
                    return b.getPercentage().compareTo(a.getPercentage());
                })
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TestResultDTO> getResultsByGrade(String grade) {
        log.debug("Fetching results with grade: {}", grade);
        return getAllResults().stream()
                .filter(r -> grade.equals(r.getGrade()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentStatistics(Long studentId) {
        log.debug("Calculating statistics for student ID: {}", studentId);
        
        Map<String, Object> stats = new HashMap<>();
        List<TestResultDTO> studentResults = getResultsByStudent(studentId);
        
        if (studentResults.isEmpty()) {
            stats.put("totalTests", 0);
            return stats;
        }
        
        stats.put("totalTests", studentResults.size());
        
        double avgScore = studentResults.stream()
                .mapToDouble(r -> r.getScoreObtained().doubleValue())
                .average()
                .orElse(0);
        stats.put("averageScore", String.format("%.2f", avgScore));
        
        double avgPercentage = studentResults.stream()
                .mapToDouble(TestResultDTO::getPercentage)
                .average()
                .orElse(0);
        stats.put("averagePercentage", String.format("%.1f", avgPercentage));
        
        double avgGpa = studentResults.stream()
                .mapToDouble(r -> r.getGpa().doubleValue())
                .average()
                .orElse(0);
        stats.put("averageGpa", String.format("%.2f", avgGpa));
        
        // Pass/Fail counts
        long passed = studentResults.stream()
                .filter(r -> "合格".equals(r.getResult()))
                .count();
        stats.put("passed", passed);
        stats.put("failed", studentResults.size() - passed);
        
        double passRate = (double) passed / studentResults.size() * 100;
        stats.put("passRate", String.format("%.1f", passRate));
        
        // Grade distribution
        Map<String, Long> gradeDist = studentResults.stream()
                .collect(Collectors.groupingBy(
                    TestResultDTO::getGrade,
                    Collectors.counting()
                ));
        stats.put("gradeDistribution", gradeDist);
        
        // Highest and lowest scores
        stats.put("highestScore", studentResults.stream()
                .map(TestResultDTO::getScoreObtained)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO));
        
        stats.put("lowestScore", studentResults.stream()
                .map(TestResultDTO::getScoreObtained)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO));
        
        return stats;
    }
}