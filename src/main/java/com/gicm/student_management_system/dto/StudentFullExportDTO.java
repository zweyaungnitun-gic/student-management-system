package com.gicm.student_management_system.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentFullExportDTO {

    // From StudentDTO
    private Long id;
    private String studentId;
    private String studentName; // studentName
    private String nameInJapanese; // nameInJapanese
    private String dateOfBirth; // dateOfBirth as String
    private String gender; // gender
    private String currentLivingAddress; // currentLivingAddress
    private String homeTownAddress; // homeTownAddress
    private String fatherName; // fatherName
    private String passportNumber; // passportNumber
    private String nationalID; // nationalID
    private String currentJapanLevel; // currentJapanLevel
    private String desiredJobType; // desiredJobType
    private String otherDesiredJobType; // otherDesiredJobType
    private String japanTravelExperience;// japanTravelExperience
    private String coeApplicationExperience; // coeApplicationExperience
    private String religion; // religion
    private String otherReligion; // otherReligion
    private Boolean isSmoking; // isSmoking
    private Boolean isAlcoholDrink; // isAlcoholDrink
    private Boolean haveTatto; // haveTatto
    private String schedulePaymentTutionDate; // schedulePaymentTutionDate
    private String hostelPreference; // hostelPreference
    private String memoNotes; // memoNotes
    private String actualTutionPaymentDate; // actualTutionPaymentDate
    private String enrolledDate; // enrolledDate
    private String status; // status
    private String passedHighestJLPTLevel; // passedHighestJLPTLevel
    private String contactViber; // contactViber
    private String paymentDueDate; // paymentDueDate
    private String paymentDate; // paymentDate

    // N5 Class fields
    private String n5ClassTeacher;
    private String n5ClassAttendance;

    private String n5ClassTestResult1;
    private String n5ClassTestResult2;
    private String n5ClassTestResult3;
    private String n5ClassTestResult4;

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

    // N4 Class fields
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

    // Interview and JLPT passed
    private String interview1;
    private String interview2;
    private String interview3;
}
