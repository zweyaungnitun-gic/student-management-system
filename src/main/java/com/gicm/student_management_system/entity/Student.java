package com.gicm.student_management_system.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

//Student 
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
    // 生徒ID

    private String studentName;
    // 生徒名

    private String nameInJapanese;
    // 日本語の名前

    private LocalDate dateOfBirth;
    // 生年月日

    private String gender;
    // 性別

    private String currentLivingAddress;
    // 現在の住所

    private String homeTownAddress;
    // 出身住所

    private String phoneNumber;
    // 電話番号

    private String secondaryPhone;
    // 予備電話番号

    private String fatherName;
    // 父親の名前

    private String passportNumber;
    // パスポート番号

    private String nationalID;
    // 国民ID

    private String currentJapanLevel;
    // 現在の日本語レベル

    private String desiredJobType;
    // 希望職種

    private String otherDesiredJobType;
    // その他の希望職種

    private String japanTravelExperience;
    // 日本渡航経験

    private String coeApplicationExperience;
    // COE申請経験

    private String religion;
    // 宗教

    private String otherReligion;
    // その他の宗教

    private Boolean isSmoking;
    // 喫煙有無

    private Boolean isAlcoholDrink;
    // 飲酒有無

    private Boolean haveTatto;
    // タトゥー有無

    private LocalDate schedulePaymentTutionDate;
    // 授業料予定支払日

    private LocalDate actualTutionPaymentDate;
    // 授業料実際支払日

    private String hostelPreference;
    // 寮の希望

    @Column(length = 2000)
    private String memoNotes;
    // メモ／備考

    private LocalDate enrolledDate;
    // 入学日

    private String attendingClassRelatedStatus;
    // 出席に関するステータス

    private String passedHighestJLPTLevel;
    // 合格した最高のJLPTレベル

    // Optional: add status (在校, 卒業, 途中退校)
    private String status;
    // 在籍状況（在校・卒業・途中退校）

    @OneToOne(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private N5Class N5Class;

}
