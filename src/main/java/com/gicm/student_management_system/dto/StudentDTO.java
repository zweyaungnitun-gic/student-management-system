package com.gicm.student_management_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDTO {
    private Long id;
    private String studentId;
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
    private String nationalId;
    private String currentJapanLevel;
    private String desiredJobType;
    private String otherDesiredJobType;
    private Boolean japanTravelExperience;
    private Boolean coeApplicationExperience;
    private String religion;
    private String otherReligion;
    private Boolean isSmoking;
    private Boolean isAlcoholDrink;
    private Boolean haveTatto;
    private LocalDate schedulePaymentTutionDate;
    private LocalDate actualTutionPaymentDate;
    private Boolean hostelPreference;
    private String memoNotes;
    private LocalDate enrolledDate;
    private String attendingClassRelatedStatus;
    private String passedHighestJlptLevel;
    private String status;
    private String contactViber;
    private LocalDate createdAt;
    private LocalDate updatedAt;
}