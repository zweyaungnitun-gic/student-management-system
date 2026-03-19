package com.gicm.student_management_system.service;

import com.gicm.student_management_system.dto.CourseResultDTO;
import com.gicm.student_management_system.dto.GradeCalculationDTO;
import com.gicm.student_management_system.dto.ReportCardDTO;
import com.gicm.student_management_system.dto.TestResultDTO;
import com.gicm.student_management_system.entity.*;
import com.gicm.student_management_system.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GradeCalculationService {

    private final TestResultRepository testResultRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ReportCardRepository reportCardRepository;
    private final StudentRepository studentRepository;
    private final AdditionalStudentInfoRepository additionalStudentInfoRepository;
    private final ObjectMapper objectMapper;

    // Calculate GPA for a student in a specific semester
    @Transactional(readOnly = true)
    public GradeCalculationDTO calculateStudentGPA(Long studentId, String academicYear, String semester) {
        log.info("Calculating GPA for student ID: {}, Academic Year: {}, Semester: {}", studentId, academicYear, semester);

        // Get all enrollments for the student in this semester
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        
        if (enrollments.isEmpty()) {
            log.warn("No enrollments found for student ID: {}", studentId);
            return GradeCalculationDTO.builder()
                .studentId(studentId)
                .overallGPA(BigDecimal.ZERO)
                .overallGrade("N/A")
                .totalTests(0)
                .build();
        }

        // Get all test results for these enrollments
        List<TestResult> allTestResults = new ArrayList<>();
        Map<String, List<TestResult>> resultsByCourse = new HashMap<>();
        Map<String, BigDecimal> gpaByCourse = new HashMap<>();
        Map<String, String> gradeByCourse = new HashMap<>();

        for (Enrollment enrollment : enrollments) {
            List<TestResult> courseResults = testResultRepository.findByEnrollmentId(enrollment.getEnrollmentId());
            allTestResults.addAll(courseResults);
            
            String courseKey = enrollment.getCourse().getCourseCode() + " - " + enrollment.getCourse().getCourseName();
            resultsByCourse.put(courseKey, courseResults);
            
            if (!courseResults.isEmpty()) {
                BigDecimal courseGpa = calculateCourseGPA(courseResults);
                gpaByCourse.put(courseKey, courseGpa);
                gradeByCourse.put(courseKey, getGradeFromGPA(courseGpa));
            }
        }

        BigDecimal overallGPA = calculateOverallGPA(gpaByCourse.values());
        String overallGrade = getGradeFromGPA(overallGPA);

        // Calculate passed/failed tests
        int passedTests = (int) allTestResults.stream()
            .filter(r -> "PASS".equals(r.getResult()))
            .count();
        int failedTests = allTestResults.size() - passedTests;

        // Convert to DTOs
        List<TestResultDTO> testResultDTOs = allTestResults.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());

        return GradeCalculationDTO.builder()
            .studentId(studentId)
            .studentName(getStudentName(studentId))
            .studentIdNumber(getStudentIdNumber(studentId))
            .testResults(testResultDTOs)
            .totalTests(allTestResults.size())
            .passedTests(passedTests)
            .failedTests(failedTests)
            .overallGPA(overallGPA)
            .overallGrade(overallGrade)
            .gpaByCourse(gpaByCourse)
            .gradeByCourse(gradeByCourse)
            .build();
    }

    // Generate report card for a student
    @Transactional
    public ReportCardDTO generateReportCard(Long studentId, String academicYear, String semester) {
        log.info("Generating report card for student ID: {}, Academic Year: {}, Semester: {}", studentId, academicYear, semester);

        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        // Get all enrollments
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        
        List<CourseResultDTO> courseResults = new ArrayList<>();
        BigDecimal totalGpaSum = BigDecimal.ZERO;
        int courseCount = 0;

        for (Enrollment enrollment : enrollments) {
            List<TestResult> testResults = testResultRepository.findByEnrollmentId(enrollment.getEnrollmentId());
            
            if (!testResults.isEmpty()) {
                CourseResultDTO courseResult = calculateCourseResult(enrollment, testResults);
                courseResults.add(courseResult);
                
                totalGpaSum = totalGpaSum.add(courseResult.getGpa() != null ? courseResult.getGpa() : BigDecimal.ZERO);
                courseCount++;
            }
        }

        // Calculate semester GPA
        BigDecimal semesterGPA = courseCount > 0 ? 
            totalGpaSum.divide(BigDecimal.valueOf(courseCount), 2, RoundingMode.HALF_UP) : 
            BigDecimal.ZERO;

        BigDecimal cumulativeGPA = semesterGPA;

        // Get class rank
        Integer classRank = calculateClassRank(studentId, academicYear, semester);
        Integer totalStudents = getTotalStudentsInClass(getStudentClassName(studentId));

        String academicStanding = determineAcademicStanding(semesterGPA);

        String reportData = convertReportDataToJson(courseResults);

        ReportCard reportCard = ReportCard.builder()
            .student(student)
            .academicYear(academicYear)
            .semester(semester)
            .generatedDate(LocalDateTime.now())
            .semesterGPA(semesterGPA)
            .cumulativeGPA(cumulativeGPA)
            .totalCredits(calculateTotalCredits(courseResults))
            .totalCourses(courseResults.size())
            .passedCourses((int) courseResults.stream().filter(r -> "Passed".equals(r.getStatus())).count())
            .failedCourses((int) courseResults.stream().filter(r -> "Failed".equals(r.getStatus())).count())
            .classRank(classRank)
            .totalStudents(totalStudents)
            .academicStanding(academicStanding)
            .reportData(reportData)
            .build();

        reportCardRepository.save(reportCard);

        return convertToReportCardDTO(reportCard, courseResults);
    }

   // Calculate course result from test results
    private CourseResultDTO calculateCourseResult(Enrollment enrollment, List<TestResult> testResults) {
        Course course = enrollment.getCourse();
        
        BigDecimal totalScore = testResults.stream()
            .map(TestResult::getScoreObtained)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal averageScore = totalScore.divide(
            BigDecimal.valueOf(testResults.size()), 2, RoundingMode.HALF_UP);

        // Calculate GPA (average of test GPAs)
        BigDecimal gpa = testResults.stream()
            .map(TestResult::getGpa)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .divide(BigDecimal.valueOf(testResults.size()), 2, RoundingMode.HALF_UP);

        String finalGrade = getGradeFromGPA(gpa);
        String status = gpa.compareTo(BigDecimal.valueOf(1.0)) >= 0 ? "Passed" : "Failed";

        List<TestResultDTO> testResultDTOs = testResults.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());

        return CourseResultDTO.builder()
            .courseId(course.getCourseId())
            .courseCode(course.getCourseCode())
            .courseName(course.getCourseName())
            .creditHours(course.getCreditHours())
            .testResults(testResultDTOs)
            .totalScore(totalScore)
            .averageScore(averageScore)
            .finalGrade(finalGrade)
            .gpa(gpa)
            .status(status)
            .teacherName(course.getTeacher() != null ? course.getTeacher().getName() : "未割当")
            .teacherRemarks("") 
            .build();
    }

    // Calculate GPA for a course based on test results
    private BigDecimal calculateCourseGPA(List<TestResult> testResults) {
        if (testResults.isEmpty()) return BigDecimal.ZERO;
        
        BigDecimal totalGpa = testResults.stream()
            .map(TestResult::getGpa)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return totalGpa.divide(BigDecimal.valueOf(testResults.size()), 2, RoundingMode.HALF_UP);
    }

    // Calculate overall GPA from course GPAs
    private BigDecimal calculateOverallGPA(Collection<BigDecimal> courseGpas) {
        if (courseGpas.isEmpty()) return BigDecimal.ZERO;
        
        BigDecimal sum = courseGpas.stream()
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return sum.divide(BigDecimal.valueOf(courseGpas.size()), 2, RoundingMode.HALF_UP);
    }

    private String getGradeFromGPA(BigDecimal gpa) {
        if (gpa == null) return "N/A";
        
        if (gpa.compareTo(BigDecimal.valueOf(3.7)) >= 0) return "A+";
        if (gpa.compareTo(BigDecimal.valueOf(3.3)) >= 0) return "A";
        if (gpa.compareTo(BigDecimal.valueOf(3.0)) >= 0) return "B+";
        if (gpa.compareTo(BigDecimal.valueOf(2.7)) >= 0) return "B";
        if (gpa.compareTo(BigDecimal.valueOf(2.3)) >= 0) return "C+";
        if (gpa.compareTo(BigDecimal.valueOf(2.0)) >= 0) return "C";
        if (gpa.compareTo(BigDecimal.valueOf(1.5)) >= 0) return "D+";
        if (gpa.compareTo(BigDecimal.valueOf(1.0)) >= 0) return "D";
        return "F";
    }

    private Integer calculateClassRank(Long studentId, String academicYear, String semester) {
        String className = getStudentClassName(studentId);
        if (className == null || className.isBlank()) return null;

        List<Student> classmates = additionalStudentInfoRepository.findByAttendingClassRelatedStatus(className).stream()
            .map(AdditionalStudentInfo::getCommonStudent)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        // Calculate GPA for each student and sort
        List<GradeCalculationDTO> classGPAs = new ArrayList<>();
        for (Student s : classmates) {
            try {
                GradeCalculationDTO gpa = calculateStudentGPA(s.getId(), academicYear, semester);
                classGPAs.add(gpa);
            } catch (Exception e) {
                log.error("Error calculating GPA for student {}: {}", s.getId(), e.getMessage());
            }
        }
        
        // Sort by overall GPA descending
        classGPAs.sort((a, b) -> b.getOverallGPA().compareTo(a.getOverallGPA()));

        // Find rank
        for (int i = 0; i < classGPAs.size(); i++) {
            if (classGPAs.get(i).getStudentId().equals(studentId)) {
                return i + 1;
            }
        }
        return null;
    }

    private Integer getTotalStudentsInClass(String className) {
        if (className == null || className.isBlank()) return 0;
        return additionalStudentInfoRepository.findByAttendingClassRelatedStatus(className).size();
    }

    private String getStudentClassName(Long studentId) {
        if (studentId == null) return null;
        return additionalStudentInfoRepository.findByCommonStudent_Id(studentId)
            .map(AdditionalStudentInfo::getAttendingClassRelatedStatus)
            .orElse(null);
    }

    private String determineAcademicStanding(BigDecimal gpa) {
        if (gpa == null) return "Good Standing";
        
        if (gpa.compareTo(BigDecimal.valueOf(3.5)) >= 0) {
            return "Dean's List";
        } else if (gpa.compareTo(BigDecimal.valueOf(2.0)) >= 0) {
            return "Good Standing";
        } else if (gpa.compareTo(BigDecimal.valueOf(1.5)) >= 0) {
            return "Academic Probation";
        } else {
            return "Academic Suspension";
        }
    }


    private Integer calculateTotalCredits(List<CourseResultDTO> courseResults) {
        return courseResults.stream()
            .map(CourseResultDTO::getCreditHours)
            .filter(Objects::nonNull)
            .reduce(0, Integer::sum);
    }

    private String convertReportDataToJson(List<CourseResultDTO> courseResults) {
        try {
            return objectMapper.writeValueAsString(courseResults);
        } catch (Exception e) {
            log.error("Error converting report data to JSON", e);
            return "[]";
        }
    }

    // Convert TestResult to DTO
    private TestResultDTO convertToDTO(TestResult testResult) {
        if (testResult == null) return null;

        return TestResultDTO.builder()
            .testResultId(testResult.getTestResultId())
            .testId(testResult.getTest().getTestId())
            .testName(testResult.getTest().getTestName())
            .courseName(testResult.getTest().getCourse().getCourseName())
            .courseCode(testResult.getTest().getCourse().getCourseCode())
            .enrollmentId(testResult.getEnrollment().getEnrollmentId())
            .studentId(testResult.getEnrollment().getStudent().getId())
            .studentName(testResult.getEnrollment().getStudent().getStudentName())
            .studentIdNumber(testResult.getEnrollment().getStudent().getStudentId())
            .scoreObtained(testResult.getScoreObtained())
            .totalMarks(testResult.getTest().getTotalMarks())
            .passingMarks(testResult.getTest().getPassingMarks())
            .grade(testResult.getGrade())
            .gpa(testResult.getGpa())
            .result("PASS".equals(testResult.getResult()) ? "合格" : 
                   "FAIL".equals(testResult.getResult()) ? "不合格" : "")
            .percentage(testResult.getPercentage())
            .teacherFeedback(testResult.getTeacherFeedback())
            .gradedById(testResult.getGradedBy() != null ? testResult.getGradedBy().getTeacherId() : null)
            .gradedByName(testResult.getGradedBy() != null ? testResult.getGradedBy().getName() : null)
            .gradedAt(testResult.getGradedAt())
            .submittedAt(testResult.getSubmittedAt())
            
            .rankInClass(null)
            .classAverage(null)
            .highestScore(null)
            .lowestScore(null)
            .build();
    }

    private ReportCardDTO convertToReportCardDTO(ReportCard reportCard, List<CourseResultDTO> courseResults) {
        return ReportCardDTO.builder()
            .studentId(reportCard.getStudent().getId())
            .studentName(reportCard.getStudent().getStudentName())
            .studentIdNumber(reportCard.getStudent().getStudentId())
            .academicYear(reportCard.getAcademicYear())
            .semester(reportCard.getSemester())
            .generatedDate(reportCard.getGeneratedDate())
            .courseResults(courseResults)
            .totalCredits(reportCard.getTotalCredits())
            .totalCourses(reportCard.getTotalCourses())
            .passedCourses(reportCard.getPassedCourses())
            .failedCourses(reportCard.getFailedCourses())
            .semesterGPA(reportCard.getSemesterGPA())
            .cumulativeGPA(reportCard.getCumulativeGPA())
            .academicStanding(reportCard.getAcademicStanding())
            .classRank(reportCard.getClassRank())
            .totalStudents(reportCard.getTotalStudents())
            .principalRemarks(reportCard.getPrincipalRemarks())
            .classTeacherRemarks(reportCard.getClassTeacherRemarks())
            .gradingScale(getGradingScale())
            .build();
    }

    private String getStudentName(Long studentId) {
        return studentRepository.findById(studentId)
            .map(Student::getStudentName)
            .orElse("");
    }

    private String getStudentIdNumber(Long studentId) {
        return studentRepository.findById(studentId)
            .map(Student::getStudentId)
            .orElse("");
    }

    private Map<String, String> getGradingScale() {
        Map<String, String> scale = new LinkedHashMap<>();
        scale.put("A+", "90-100% (4.0)");
        scale.put("A", "80-89% (4.0)");
        scale.put("B+", "75-79% (3.5)");
        scale.put("B", "70-74% (3.0)");
        scale.put("C+", "65-69% (2.5)");
        scale.put("C", "60-64% (2.0)");
        scale.put("D+", "55-59% (1.5)");
        scale.put("D", "50-54% (1.0)");
        scale.put("F", "Below 50% (0.0)");
        return scale;
    }
}