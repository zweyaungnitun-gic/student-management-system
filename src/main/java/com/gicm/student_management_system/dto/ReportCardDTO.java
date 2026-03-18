package com.gicm.student_management_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportCardDTO {
    private Long studentId;
    private String studentName;
    private String studentIdNumber;
    private String academicYear;
    private String semester;
    private LocalDateTime generatedDate;
    
    // Course-wise results
    private List<CourseResultDTO> courseResults;
    
    // Summary statistics
    private Integer totalCredits;
    private Integer totalCourses;
    private Integer passedCourses;
    private Integer failedCourses;
    
    // GPA and Grades
    private BigDecimal semesterGPA;
    private BigDecimal cumulativeGPA;
    private String academicStanding; 
    
    // Ranking
    private Integer classRank;
    private Integer totalStudents;
    
    // Teacher comments
    private String principalRemarks;
    private String classTeacherRemarks;
    
    // Grading scale
    private Map<String, String> gradingScale;
}