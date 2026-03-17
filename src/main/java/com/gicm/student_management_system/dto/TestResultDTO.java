package com.gicm.student_management_system.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestResultDTO {
    private Long testResultId;

    @NotNull(message = "テストは必須です")
    private Long testId;
    private String testName;

    @NotNull(message = "受講登録は必須です")
    private Long enrollmentId;
    private String studentName;
    private String studentId;
    private String courseName;

    @NotNull(message = "得点は必須です")
    @DecimalMin(value = "0.0", message = "得点は0以上でなければなりません")
    @DecimalMax(value = "999.99", message = "得点は999.99以下でなければなりません")
    private BigDecimal scoreObtained;

    private Integer totalMarks;
    private Integer passingMarks;
    private String result; // Pass/Fail

    @Size(max = 1000, message = "フィードバックは1000文字以内で入力してください")
    private String teacherFeedback;

    private Long gradedById;
    private String gradedByName;
    private LocalDateTime gradedAt;
    private LocalDateTime submittedAt;
}