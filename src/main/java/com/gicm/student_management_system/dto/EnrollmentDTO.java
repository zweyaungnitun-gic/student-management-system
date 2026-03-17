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
    private String courseCode;
    private String courseName;
    private String semester;
    private String status;
    private String initiatedBy;
    private LocalDateTime enrollmentRequestDate;
    private LocalDateTime approvedAt;
    private LocalDateTime completedAt;
    private LocalDateTime enrolledDate;
    private LocalDateTime enrollmentDate;
    
    // Helper method to get status in Japanese for display
    public String getStatusDisplay() {
        if (status == null) return null;
        
        switch (status) {
            case "pending":
                return "保留中";
            case "enrolled":
                return "在校";
            case "completed":
                return "卒業";
            case "dropped":
                return "退学";
            case "failed":
                return "不合格";
            default:
                return status;
        }
    }
    
    // Original status for database operations
    public String getOriginalStatus() {
        return status;
    }
}