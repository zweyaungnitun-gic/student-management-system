package com.gicm.student_management_system.entity;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "common_students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", unique = true, nullable = false)
    private String studentId;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private String gender;

    @Column(name = "current_living_address")
    private String currentLivingAddress;

    @Column(name = "home_town_address")
    private String homeTownAddress;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "national_id", unique = true, nullable = false)
    private String nationalId;

    private String religion;

    @Column(name = "enrolled_date")
    private LocalDate enrolledDate;

    @Column(name = "created_at")
    private LocalDate createdAt;

    @Column(name = "updated_at")
    private LocalDate updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "registration_status", nullable = false)
    private RegistrationStatus registrationStatus;

    @PrePersist
    protected void onCreate() {
        if (this.studentId == null || this.studentId.isBlank()) {
            this.studentId = "TEMP-" + UUID.randomUUID().toString().substring(0, 8);
        }
        this.createdAt = LocalDate.now();
        this.updatedAt = LocalDate.now();
        if (this.enrolledDate == null) {
            this.enrolledDate = this.createdAt;
        }
        if (this.registrationStatus == null) {
            this.registrationStatus = RegistrationStatus.ACCEPTED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDate.now();
    }
}

