package com.gicm.student_management_system.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdditionalStudentInfoDTO {
    private String nameInJapanese;
    private String passportNumber;
    private String currentJapanLevel;
    private Boolean japanTravelExperience;
    private Boolean coeApplicationExperience;
    private String passedHighestJlptLevel;
    private String secondaryPhone;
    private String fatherName;
    private String desiredJobType;
    private String otherDesiredJobType;
    private Boolean isSmoking;
    private Boolean isAlcoholDrink;
    private Boolean haveTatto;
    private Boolean hostelPreference;
    private String memoNotes;
    private String attendingClassRelatedStatus;
    private String contactViber;
    private LocalDate schedulePaymentTutionDate;
    private LocalDate actualTutionPaymentDate;
    private String otherReligion;
}