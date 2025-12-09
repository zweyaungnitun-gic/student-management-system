package com.gicm.student_management_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

import com.gicm.student_management_system.entity.InterviewNotes;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDTO {
    private Long id;
    private String studentName;
    private String nameInJapanese;
    private LocalDate dateOfBirth;

    private String gender;
    private String currentLivingAddress;
    private String homeTownAddress;

    private String phoneNumber;
    private String secondaryPhone;
    private String fatherName;
    private String passportNumber;
    private String nationalID;
    private String currentJapanLevel;

    private String desiredJobType;
    private String otherDesiredJobType;
    private String japanTravelExperience;
    private String coeApplicationExperience;
    private String religion;
    private String otherReligion;
    private Boolean isSmoking;
    private Boolean isAlcoholDrink;
    private Boolean haveTatto;
    private LocalDate schedulePaymentTutionDate;
    private LocalDate actualTutionPaymentDate;
    private String hostelPreference;
    private String memoNotes;
    private LocalDate enrolledDate;
    private String passedHighestJLPTLevel;
    private String contactViber;
    private InterviewNotes interviewNotes;
    private LocalDate createdAt;
    private LocalDate updatedAt;
    private String status;
    private LocalDate paymentDueDate;
    private LocalDate paymentDate;
}
