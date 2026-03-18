package com.gicm.student_management_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResultDTO {
    private Long courseId;
    private String courseCode;
    private String courseName;
    private Integer creditHours;
    
    private List<TestResultDTO> testResults;
    
    // Course statistics
    private BigDecimal totalScore;
    private BigDecimal averageScore;
    private String finalGrade;
    private BigDecimal gpa;
    
    private String status; // Passed, Failed, Incomplete
    
    private String teacherName;
    private String teacherRemarks;
}