package com.gicm.student_management_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import com.gicm.student_management_system.validation.*;
import jakarta.validation.constraints.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDTO {

    private Long id;

    private String studentId;

    @NotBlank(groups = BasicInfoGroup.class, message = "This field is required")
    @Size(max = 100, groups = BasicInfoGroup.class)
    private String studentName;

    @NotNull(groups = BasicInfoGroup.class, message = "This field is required")
    @Past(groups = BasicInfoGroup.class, message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @NotBlank(groups = BasicInfoGroup.class, message = "This field is required")
    private String gender;

    @NotBlank(groups = BasicInfoGroup.class, message = "This field is required")
    @Size(max = 255, groups = BasicInfoGroup.class)
    private String currentLivingAddress;

    @NotBlank(groups = BasicInfoGroup.class, message = "This field is required")
    private String homeTownAddress;

    @NotBlank(groups = BasicInfoGroup.class, message = "This field is required")
    private String phoneNumber;

    @NotBlank(groups = BasicInfoGroup.class, message = "This field is required")
    private String nationalId;

    @NotBlank(groups = BasicInfoGroup.class, message = "This field is required")
    private String religion;

    @NotNull(groups = BasicInfoGroup.class, message = "This field is required")
    private LocalDate enrolledDate;

    @NotNull
    private LocalDate createdAt;

    @NotNull
    private LocalDate updatedAt;
}