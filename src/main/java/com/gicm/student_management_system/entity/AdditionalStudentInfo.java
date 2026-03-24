package com.gicm.student_management_system.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "additional_student_info")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdditionalStudentInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Extra fields for a student, split out from {@link Student}.
     */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "common_student_id", nullable = false, unique = true)
    private Student commonStudent;

    // --- Japanese-school / international related ---
    @Column(name = "name_in_japanese")
    private String nameInJapanese;

    @Column(name = "passport_number")
    private String passportNumber;

    @Column(name = "current_japan_level")
    private String currentJapanLevel;

    @Column(name = "japan_travel_experience")
    private Boolean japanTravelExperience;

    @Column(name = "coe_application_experience")
    private Boolean coeApplicationExperience;

    @Column(name = "passed_highest_jlpt_level")
    private String passedHighestJlptLevel;

    // --- Contact / family (not in CommonStudent lines 29-85) ---
    @Column(name = "secondary_phone")
    private String secondaryPhone;

    @Column(name = "father_name")
    private String fatherName;

    // --- Preferences / lifestyle / admin ---
    @Column(name = "desired_job_type")
    private String desiredJobType;

    @Column(name = "other_desired_job_type")
    private String otherDesiredJobType;

    @Column(name = "is_smoking")
    private Boolean isSmoking;

    @Column(name = "is_alcohol_drink")
    private Boolean isAlcoholDrink;

    @Column(name = "have_tatto")
    private Boolean haveTatto;

    @Column(name = "hostel_preference")
    private Boolean hostelPreference;

    @Column(name = "memo_notes", length = 2000)
    private String memoNotes;

    @Column(name = "attending_class_related_status")
    private String attendingClassRelatedStatus;

    @Column(name = "contact_viber")
    private String contactViber;

    @Column(name = "schedule_payment_tution_date")
    private LocalDate schedulePaymentTutionDate;

    @Column(name = "actual_tution_payment_date")
    private LocalDate actualTutionPaymentDate;

    @Column(name = "other_religion")
    private String otherReligion;
    
}