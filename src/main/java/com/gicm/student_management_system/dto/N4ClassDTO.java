package com.gicm.student_management_system.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class N4ClassDTO {

    private Long id;
    private Long studentId; // To link to the student

    private String n4ClassTeacher;
    private String n4ClassAttendance;
    
    private String n4ClassTestResult1;
    private String n4ClassTestResult2;
    private String n4ClassTestResult3;
    private String n4ClassTestResult4;

    private String n4ClassFeedback;
    
    private String n4Class1Teacher;
    private String n4Class1AttendanceRate;
    private String n4Class1TestResult;
    private String n4Class1TeacherFeedback;

    private String n4Class2Teacher;
    private String n4Class2AttendanceRate;
    private String n4Class2TestResult;
    private String n4Class2TeacherFeedback;
    
    private String n4Class3Teacher;
    private String n4Class3AttendanceRate;
    private String n4Class3TestResult;
    private String n4Class3TeacherFeedback;
}