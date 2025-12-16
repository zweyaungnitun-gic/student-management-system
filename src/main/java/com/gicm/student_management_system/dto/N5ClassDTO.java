package com.gicm.student_management_system.dto;

import jakarta.validation.constraints.Size;
// Changed from Getter/Setter to Data to match StudentDTO
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class N5ClassDTO {

    private Long id;
    private Long studentId; // To link to the student

    @Size(max = 100, message = "Teacher name too long")
    private String n5ClassTeacher;
    private String n5ClassAttendance;

    private String n5ClassTestResult1;
    private String n5ClassTestResult2;
    private String n5ClassTestResult3;
    private String n5ClassTestResult4;

    @Size(max = 500, message = "Feedback too long")
    private String n5ClassFeedback;

    private String n5Class1Teacher;
    private String n5Class1AttendanceRate;
    private String n5Class1TestResult;
    private String n5Class1TeacherFeedback;

    private String n5Class2Teacher;
    private String n5Class2AttendanceRate;
    private String n5Class2TestResult;
    private String n5Class2TeacherFeedback;

    private String n5Class3Teacher;
    private String n5Class3AttendanceRate;
    private String n5Class3TestResult;
    private String n5Class3TeacherFeedback;
}