package com.gicm.student_management_system.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDTO {
    private Long courseId;

    @NotBlank(message = "コースコードは必須です")
    @Size(max = 20, message = "コースコードは20文字以内で入力してください")
    private String courseCode;

    @NotBlank(message = "コース名は必須です")
    @Size(max = 200, message = "コース名は200文字以内で入力してください")
    private String courseName;

    @Size(max = 500, message = "説明は500文字以内で入力してください")
    private String description;

    @NotNull(message = "単位数は必須です")
    @Min(value = 1, message = "単位数は1以上でなければなりません")
    private Integer creditHours;

    private Long teacherId;
    private String teacherName;

    private Boolean isActive;
    private OffsetDateTime createdAt;
}