package com.gicm.student_management_system.entity;
 
import jakarta.persistence.*;
import lombok.*;
 
import java.time.LocalDate;
 
@Entity
@Table(name = "students", 
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "student_id"),
        @UniqueConstraint(columnNames = "national_id"),
        @UniqueConstraint(columnNames = "passport_number")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(name = "student_name")
    private String studentName;
 
    @Column(name = "name_in_japanese")
    private String nameInJapanese;
 
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
 
    @Column(name = "gender")
    private String gender;
 
    @Column(name = "current_living_address", length = 500)
    private String currentLivingAddress;
 
    @Column(name = "home_town_address", length = 500)
    private String homeTownAddress;
 
    @Column(name = "phone_number")
    private String phoneNumber;
 
    @Column(name = "secondary_phone")
    private String secondaryPhone;
 
    @Column(name = "father_name")
    private String fatherName;
 
    @Column(name = "passport_number")
    private String passportNumber;
 
    @Column(name = "national_id")
    private String nationalID;
 
    @Column(name = "current_japan_level")
    private String currentJapanLevel;
 
    @Column(name = "desired_job_type")
    private String desiredJobType;
 
    @Column(name = "other_desired_job_type")
    private String otherDesiredJobType;
 
    @Column(name = "japan_travel_experience")
    private String japanTravelExperience;
 
    @Column(name = "coe_application_experience")
    private String coeApplicationExperience;
 
    @Column(name = "religion")
    private String religion;
 
    @Column(name = "other_religion")
    private String otherReligion;
 
    @Column(name = "is_smoking")
    private Boolean isSmoking;
 
    @Column(name = "is_alcohol_drink")
    private Boolean isAlcoholDrink;
 
    @Column(name = "have_tattoo")
    private Boolean haveTattoo;
 
    @Column(name = "schedule_payment_tuition_date")
    private LocalDate schedulePaymentTuitionDate;
 
    @Column(name = "actual_tuition_payment_date")
    private LocalDate actualTuitionPaymentDate;
 
    @Column(name = "hostel_preference")
    private String hostelPreference;
 
    @Column(name = "memo_notes", length = 2000)
    private String memoNotes;
 
    @Column(name = "enrolled_date")
    private LocalDate enrolledDate;
 
    @Column(name = "attending_class_related_status")
    private String attendingClassRelatedStatus;
 
    @Column(name = "passed_highest_jlpt_level")
    private String passedHighestJLPTLevel;
 
    @Column(name = "status")
    private String status;
 
    @Column(name = "contact_viber")
    private String contactViber;
 
    @Column(name = "student_id")
    private String studentId;
 
    // Comment out or create these entity classes: N4Class, N5Class, InterviewNotes
    // @OneToOne(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    // private N4Class n4Class;
 
    // @OneToOne(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    // private InterviewNotes interviewNotes;
 
    // @OneToOne(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    // private N5Class n5Class;
 
    @Column(name = "created_at", updatable = false)
    private LocalDate createdAt;
 
    @Column(name = "updated_at")
    private LocalDate updatedAt;
 
    @PrePersist
    protected void onCreate() {
     createdAt = LocalDate.now();
     updatedAt = LocalDate.now();
    }
 
    @PreUpdate
    protected void onUpdate() {
     updatedAt = LocalDate.now();
    }
}
