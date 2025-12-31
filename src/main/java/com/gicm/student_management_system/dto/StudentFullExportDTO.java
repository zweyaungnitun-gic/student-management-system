package com.gicm.student_management_system.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

// KZT
public class StudentFullExportDTO {

    // データベース上のユニークなID
    private Long id;

    // 学生管理番号
    private String studentId;

    // 学生の氏名（英語表記）
    private String studentName;

    // 学生の氏名（日本語表記）
    private String nameInJapanese;

    // 生年月日（文字列形式）
    private String dateOfBirth;

    // 性別
    private String gender;

    // 現住所
    private String currentLivingAddress;

    // 出身地の住所
    private String homeTownAddress;

    // 父親の名前
    private String fatherName;

    // パスポート番号
    private String passportNumber;

    // 国民識別番号（マイナンバー等）
    private String nationalID;

    // 現在の日本語能力レベル
    private String currentJapanLevel;

    // 希望する職種
    private String desiredJobType;

    // その他の希望職種
    private String otherDesiredJobType;

    // 日本への渡航経験
    private String japanTravelExperience;

    // 在留資格認定証明書（COE）の申請経験
    private String coeApplicationExperience;

    // 宗教
    private String religion;

    // その他の宗教
    private String otherReligion;

    // 喫煙の有無
    private Boolean isSmoking;

    // 飲酒の有無
    private Boolean isAlcoholDrink;

    // 入れ墨（タトゥー）の有無
    private Boolean haveTatto;

    // 授業料の支払予定日
    private String schedulePaymentTutionDate;

    // 寮の希望
    private String hostelPreference;

    // 事務用メモ・備考
    private String memoNotes;

    // 実際の授業料支払日
    private String actualTutionPaymentDate;

    // 入学日
    private String enrolledDate;

    // 現在のステータス（在学中・退学等）
    private String status;

    private String attendingClassRelatedStatus;

    // 合格済みの最高JLPTレベル
    private String passedHighestJLPTLevel;

    // Viber（連絡用アプリ）の連絡先
    private String contactViber;

    // 主要な電話番号
    private String phoneNumber;

    // 緊急連絡先または保護者の電話番号
    private String secondaryPhone;

    // 支払期限日
    private String paymentDueDate;

    // 支払完了日
    private String paymentDate;

    // N5クラスの担当教師
    private String n5ClassTeacher;

    // N5クラスの出席状況
    private String n5ClassAttendance;

    // N5クラスのテスト結果1
    private String n5ClassTestResult1;

    // N5クラスのテスト結果2
    private String n5ClassTestResult2;

    // N5クラスのテスト結果3
    private String n5ClassTestResult3;

    // N5クラスのテスト結果4
    private String n5ClassTestResult4;

    // N5クラスの総合フィードバック
    private String n5ClassFeedback;

    // N5第1セクションの担当教師
    private String n5Class1Teacher;

    // N5第1セクションの出席率
    private String n5Class1AttendanceRate;

    // N5第1セクションのテスト結果
    private String n5Class1TestResult;

    // N5第1セクションの教師フィードバック
    private String n5Class1TeacherFeedback;

    // N5第2セクションの担当教師
    private String n5Class2Teacher;

    // N5第2セクションの出席率
    private String n5Class2AttendanceRate;

    // N5第2セクションのテスト結果
    private String n5Class2TestResult;

    // N5第2セクションの教師フィードバック
    private String n5Class2TeacherFeedback;

    // N5第3セクションの担当教師
    private String n5Class3Teacher;

    // N5第3セクションの出席率
    private String n5Class3AttendanceRate;

    // N5第3セクションのテスト結果
    private String n5Class3TestResult;

    // N5第3セクションの教師フィードバック
    private String n5Class3TeacherFeedback;

    // N4クラスの担当教師
    private String n4ClassTeacher;

    // N4クラスの出席状況
    private String n4ClassAttendance;

    // N4クラスのテスト結果1
    private String n4ClassTestResult1;

    // N4クラスのテスト結果2
    private String n4ClassTestResult2;

    // N4クラスのテスト結果3
    private String n4ClassTestResult3;

    // N4クラスのテスト結果4
    private String n4ClassTestResult4;

    // N4クラスの総合フィードバック
    private String n4ClassFeedback;

    // N4第1セクションの担当教師
    private String n4Class1Teacher;

    // N4第1セクションの出席率
    private String n4Class1AttendanceRate;

    // N4第1セクションのテスト結果
    private String n4Class1TestResult;

    // N4第1セクションの教師フィードバック
    private String n4Class1TeacherFeedback;

    // N4第2セクションの担当教師
    private String n4Class2Teacher;

    // N4第2セクションの出席率
    private String n4Class2AttendanceRate;

    // N4第2セクションのテスト結果
    private String n4Class2TestResult;

    // N4第2セクションの教師フィードバック
    private String n4Class2TeacherFeedback;

    // N4第3セクションの担当教師
    private String n4Class3Teacher;

    // N4第3セクションの出席率
    private String n4Class3AttendanceRate;

    // N4第3セクションのテスト結果
    private String n4Class3TestResult;

    // N4第3セクションの教師フィードバック
    private String n4Class3TeacherFeedback;

    // 面接1の結果・メモ
    private String interview1;

    // 面接2の結果・メモ
    private String interview2;

    // 面接3の結果・メモ
    private String interview3;

    // その他追記用メモ
    private String otherMemo;
}