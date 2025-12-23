package com.gicm.student_management_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import com.gicm.student_management_system.validation.*;
import jakarta.validation.constraints.*;
import com.gicm.student_management_system.entity.InterviewNotes;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDTO {

    private Long id;

    @NotBlank(groups = BasicInfoGroup.class, message = "This field is required")
    @Size(max = 100, groups = BasicInfoGroup.class)
    private String studentName;

    @NotBlank(groups = BasicInfoGroup.class, message = "This field is required")
    @Size(max = 100, groups = BasicInfoGroup.class)
    private String nameInJapanese;

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
    private String secondaryPhone;

    @NotBlank(groups = BasicInfoGroup.class, message = "This field is required")
    private String fatherName;

    private String passportNumber; // optional

    @NotBlank(groups = BasicInfoGroup.class, message = "This field is required")
    private String nationalID;

    @NotBlank(groups = BasicInfoGroup.class, message = "This field is required")
    private String currentJapanLevel;

    @NotBlank(groups = BasicInfoGroup.class, message = "This field is required")
    private String desiredJobType;

    private String otherDesiredJobType; // optional

    @NotNull(groups = BasicInfoGroup.class, message = "This field is required")
    private Boolean japanTravelExperience;

    @NotNull(groups = BasicInfoGroup.class, message = "This field is required")
    private Boolean coeApplicationExperience;

    @NotBlank(groups = BasicInfoGroup.class, message = "This field is required")
    private String religion;

    private String otherReligion; // optional

    @NotNull(groups = BasicInfoGroup.class, message = "This field is required")
    private Boolean isSmoking;

    @NotNull(groups = BasicInfoGroup.class, message = "This field is required")
    private Boolean isAlcoholDrink;

    @NotNull(groups = BasicInfoGroup.class, message = "This field is required")
    private Boolean haveTatto;

    @FutureOrPresent(groups = PaymentGroup.class)
    private LocalDate schedulePaymentTutionDate;

    @NotNull(groups = PaymentGroup.class, message = "This field is required")
    @FutureOrPresent(groups = PaymentGroup.class)
    private LocalDate actualTutionPaymentDate;

    @NotNull(groups = BasicInfoGroup.class, message = "This field is required")
    private Boolean hostelPreference;

    private String memoNotes; // optional
    @NotNull(groups = BasicInfoGroup.class, message = "This field is required")
    private LocalDate enrolledDate;

    @NotBlank(groups = BasicInfoGroup.class, message = "This field is required")
    private String passedHighestJLPTLevel;

    @NotBlank(groups = BasicInfoGroup.class, message = "This field is required")
    private String contactViber;

    @NotNull(groups = BasicInfoGroup.class, message = "This field is required")
    private InterviewNotes interviewNotes;

    @NotBlank(groups = StatusGroup.class, message = "This field is required")
    private String status;

    @NotNull(groups = PaymentGroup.class, message = "This field is required")
    private LocalDate paymentDueDate;

    @NotNull(groups = PaymentGroup.class, message = "This field is required")
    private LocalDate paymentDate;

    @NotNull
    private LocalDate createdAt;

    @NotNull
    private LocalDate updatedAt;

    @NotBlank(groups = BasicInfoGroup.class, message = "This field is required")
    private String studentId;
}