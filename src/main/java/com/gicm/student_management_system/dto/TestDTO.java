package com.gicm.student_management_system.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestDTO {
    private Long testId;

    @NotNull(message = "コースは必須です")
    private Long courseId;
    private String courseName;
    private String courseCode;

    @NotBlank(message = "テスト名は必須です")
    @Size(max = 100, message = "テスト名は100文字以内で入力してください")
    private String testName;

    @Size(max = 500, message = "説明は500文字以内で入力してください")
    private String description;

    @NotNull(message = "総合点は必須です")
    @Min(value = 1, message = "総合点は1以上でなければなりません")
    private Integer totalMarks;

    @Min(value = 0, message = "合格点は0以上でなければなりません")
    private Integer passingMarks;

    private LocalDateTime testDate;

    @Min(value = 1, message = "試験時間は1分以上でなければなりません")
    private Integer durationMinutes;

    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
}