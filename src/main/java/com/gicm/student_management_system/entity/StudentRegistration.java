package com.gicm.student_management_system.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "registration_list")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "registration_code", unique = true, nullable = false)
    private String registrationCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "registration_status", nullable = false)
    private RegistrationStatus registrationStatus;

    @Column(name = "submitted_at", nullable = false)
    private LocalDate submittedAt;

    @Column(name = "decided_at")
    private LocalDate decidedAt;

    @Column(name = "decided_by")
    private String decidedBy;

    @Column(name = "accepted_student_id")
    private String acceptedStudentId;

    // --- Basic info ---
    @Column(name = "english_name", nullable = false)
    private String englishName;

    @Column(name = "katakana_name")
    private String katakanaName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender")
    private String gender;

    @Column(name = "current_address")
    private String currentAddress;

    @Column(name = "hometown_address")
    private String hometownAddress;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "guardian_phone_number")
    private String guardianPhoneNumber;

    // --- Second page ---
    @Column(name = "father_name")
    private String fatherName;

    @Column(name = "passport_number")
    private String passportNumber;

    @Column(name = "national_id_number", unique = true, nullable = false)
    private String nationalIdNumber;

    @Column(name = "jlpt_level")
    private String jlptLevel;

    @Column(name = "desired_occupation")
    private String desiredOccupation;

    @Column(name = "other_occupation")
    private String otherOccupation;

    @Column(name = "japan_travel_experience")
    private Boolean japanTravelExperience;

    @Column(name = "coe_application_experience")
    private Boolean coeApplicationExperience;

    // --- Third page ---
    @Column(name = "religion")
    private String religion;

    @Column(name = "other_religion")
    private String otherReligion;

    @Column(name = "smoking")
    private Boolean smoking;

    @Column(name = "alcohol")
    private Boolean alcohol;

    @Column(name = "tattoo")
    private Boolean tattoo;

    @Column(name = "tuition_payment_date")
    private LocalDate tuitionPaymentDate;

    @Column(name = "want_dorm")
    private Boolean wantDorm;

    @Column(name = "other_memo", length = 2000)
    private String otherMemo;

    @PrePersist
    protected void onCreate() {
        if (this.submittedAt == null) {
            this.submittedAt = LocalDate.now();
        }
        if (this.registrationStatus == null) {
            this.registrationStatus = RegistrationStatus.PENDING;
        }
    }
}

