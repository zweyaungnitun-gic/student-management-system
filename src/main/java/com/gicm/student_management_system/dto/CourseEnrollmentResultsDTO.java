package com.gicm.student_management_system.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseEnrollmentResultsDTO {
    private Long enrollmentId;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private String semester;
    private String enrollmentStatus;

    private List<TestResultDTO> results;
}

