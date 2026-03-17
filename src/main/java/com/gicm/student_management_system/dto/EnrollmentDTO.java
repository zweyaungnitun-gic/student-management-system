package com.gicm.student_management_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentDTO {
    private Long enrollmentId;
    private Long studentId;
    private String studentName;
    private String studentIdNumber;
    private Long courseId;
    private String courseName;
    private String courseCode;
    private String semester;
    private String status; // pending, enrolled, completed, dropped, failed
    private String initiatedBy; // student, admin
    private LocalDateTime enrollmentRequestDate;
    private LocalDateTime approvedAt;
    private LocalDateTime completedAt;
    private LocalDateTime enrolledDate;
}