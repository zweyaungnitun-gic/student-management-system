package com.gicm.student_management_system.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "n4_class") 
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class N4Class {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", referencedColumnName = "id")
    private Student student;

    // ==================================================

    private String n4ClassTeacher;
    // 担当教師

    private String n4ClassAttendance;
    // 出席率
    
    private String n4ClassTestResult1;
    // 日本語テスト結果 1

    private String n4ClassTestResult2;
    // 日本語テスト結果 2

    private String n4ClassTestResult3;
    // 日本語テスト結果 3

    private String n4ClassTestResult4;
    // 日本語テスト結果 4

    @Column(length = 2000)
    private String n4ClassFeedback;
    // 教師所感

    // ================================================
    
    private String n4Class1Teacher;
    // クラス① 担当教師

    private String n4Class1AttendanceRate;
    // クラス① 出席率

    private String n4Class1TestResult;
    // クラス① 日本語テスト結果

    @Column(length = 2000)
    private String n4Class1TeacherFeedback;
    // クラス① 教師所感

    // ==================================================

    private String n4Class2Teacher;
    // クラス② 担当教師

    private String n4Class2AttendanceRate;
    // クラス② 出席率

    private String n4Class2TestResult;
    // クラス② 日本語テスト結果

    @Column(length = 2000)
    private String n4Class2TeacherFeedback;
    // クラス② 教師所感
    
    // ==================================================

    private String n4Class3Teacher;
    // クラス③ 担当教師

    private String n4Class3AttendanceRate;
    // クラス③ 出席率

    private String n4Class3TestResult;
    // クラス③ 日本語テスト結果

    @Column(length = 2000)
    private String n4Class3TeacherFeedback;
    // クラス③ 教師所感
}