package com.gicm.student_management_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeCalculationDTO {
    private Long studentId;
    private String studentName;
    private String studentIdNumber;
    
    private List<TestResultDTO> testResults;
    
    private Integer totalTests;
    private Integer passedTests;
    private Integer failedTests;
    
    // GPA Calculation (based on 4.0 scale)
    private BigDecimal overallGPA;
    private String overallGrade;
    
    private Map<String, BigDecimal> gpaByCourse;
    private Map<String, String> gradeByCourse;
    
    // Ranking
    private Integer overallRank;
    private Integer rankInCourse;
    private Integer totalStudents;
}