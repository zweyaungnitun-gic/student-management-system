package com.gicm.student_management_system.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "students")
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
    // 生徒名

    @Column(name = "name_in_japanese")
    private String nameInJapanese;
    // 日本語の名前

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    // 生年月日

    private String gender;
    // 性別

    @Column(name = "current_living_address")
    private String currentLivingAddress;
    // 現在の住所

    @Column(name = "home_town_address")
    private String homeTownAddress;
    // 出身住所

    @Column(name = "phone_number")
    private String phoneNumber;
    // 電話番号

    @Column(name = "secondary_phone")
    private String secondaryPhone;
    // 予備電話番号

    @Column(name = "father_name")
    private String fatherName;
    // 父親の名前

    @Column(name = "passport_number")
    private String passportNumber;
    // パスポート番号

    @Column(name = "national_id")
    private String nationalID;
    // 国民ID

    @Column(name = "current_japan_level")
    private String currentJapanLevel;
    // 現在の日本語レベル

    @Column(name = "desired_job_type")
    private String desiredJobType;
    // 希望職種

    @Column(name = "other_desired_job_type")
    private String otherDesiredJobType;
    // その他の希望職種

    @Column(name = "japan_travel_experience")
    private String japanTravelExperience;
    // 日本渡航経験

    @Column(name = "coe_application_experience")
    private String coeApplicationExperience;
    // COE申請経験

    private String religion;
    // 宗教

    @Column(name = "other_religion")
    private String otherReligion;
    // その他の宗教

    @Column(name = "is_smoking")
    private Boolean isSmoking;
    // 喫煙有無

    @Column(name = "is_alcohol_drink")
    private Boolean isAlcoholDrink;
    // 飲酒有無

    @Column(name = "have_tatto")
    private Boolean haveTatto;
    // タトゥー有無

    @Column(name = "schedule_payment_tution_date")
    private LocalDate schedulePaymentTutionDate;
    // 授業料予定支払日

    @Column(name = "actual_tution_payment_date")
    private LocalDate actualTutionPaymentDate;
    // 授業料実際支払日

    @Column(name = "hostel_preference")
    private String hostelPreference;
    // 寮の希望

    @Column(name = "memo_notes", length = 2000)
    private String memoNotes;
    // メモ／備考

    @Column(name = "enrolled_date")
    private LocalDate enrolledDate;
    // 入学日

    @Column(name = "attending_class_related_status")
    private String attendingClassRelatedStatus;
    // 出席に関するステータス

    @Column(name = "passed_highest_jlpt_level")
    private String passedHighestJLPTLevel;
    // 合格した最高のJLPTレベル

    private String status;
    // 在籍状況（在校・卒業・途中退校）

    @Column(name = "contact_viber")
    private String contactViber;
    // 連絡先(TEL, Viber)

    @Column(name = "student_id")
    private String studentId;
    // 生徒ID

    @OneToOne(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private N4Class n4Class;

    @OneToOne(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private InterviewNotes interviewNotes;

    @Column(name = "created_at")
    private LocalDate createdAt;

    @Column(name = "updated_at")
    private LocalDate updatedAt;
    @OneToOne(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private N5Class N5Class;

}