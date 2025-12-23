package com.gicm.student_management_system.serviceimpl;

import com.gicm.student_management_system.dto.StudentFullExportDTO;
import com.gicm.student_management_system.enums.YesNoDisplay;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.service.StudentExportService;
import com.gicm.student_management_system.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentExportServiceImpl implements StudentExportService {

    private final StudentService studentService;

    @Override
    public List<StudentFullExportDTO> getAllStudentsFull(String nameSearch,
            String status) {
        return studentService.getStudentsByFilterFull(nameSearch, status).stream()
                .map(this::convertToExportDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentFullExportDTO> getStudentsByIds(List<Long> ids) {
        // Use the new efficient method
        return studentService.findAllByIds(ids).stream()
                .map(this::convertToExportDTO)
                .collect(Collectors.toList());
    }

    private StudentFullExportDTO convertToExportDTO(Student s) {
        StudentFullExportDTO dto = new StudentFullExportDTO();

        // --- StudentDTO fields ---
        dto.setId(s.getId());
        dto.setStudentId(s.getStudentId());
        dto.setStudentName(s.getStudentName());
        dto.setNameInJapanese(s.getNameInJapanese());
        dto.setDateOfBirth(s.getDateOfBirth() != null ? s.getDateOfBirth().toString()
                : "");
        dto.setGender(s.getGender());
        dto.setCurrentLivingAddress(s.getCurrentLivingAddress());
        dto.setHomeTownAddress(s.getHomeTownAddress());
        dto.setContactViber(s.getContactViber());
        dto.setFatherName(s.getFatherName());
        dto.setPassportNumber(s.getPassportNumber());
        dto.setNationalID(s.getNationalID());
        dto.setCurrentJapanLevel(s.getCurrentJapanLevel());
        dto.setDesiredJobType(s.getDesiredJobType());
        dto.setOtherDesiredJobType(s.getOtherDesiredJobType());
        dto.setJapanTravelExperience(YesNoDisplay.from(s.getJapanTravelExperience()).getLabel());
        dto.setCoeApplicationExperience(YesNoDisplay.from(s.getCoeApplicationExperience()).getLabel());
        dto.setReligion(s.getReligion());
        dto.setOtherReligion(s.getOtherReligion());
        dto.setIsSmoking(s.getIsSmoking());
        dto.setIsAlcoholDrink(s.getIsAlcoholDrink());
        dto.setHaveTatto(s.getHaveTatto());
        dto.setSchedulePaymentTutionDate(
                s.getSchedulePaymentTutionDate() != null ? s.getSchedulePaymentTutionDate().toString() : "");
        dto.setHostelPreference(YesNoDisplay.from(s.getHostelPreference()).getLabel());
        dto.setMemoNotes(s.getMemoNotes());
        dto.setActualTutionPaymentDate(
                s.getActualTutionPaymentDate() != null ? s.getActualTutionPaymentDate().toString() : "");
        dto.setEnrolledDate(s.getEnrolledDate() != null ? s.getEnrolledDate().toString() : "");
        dto.setStatus(s.getStatus());
        dto.setPassedHighestJLPTLevel(s.getPassedHighestJLPTLevel());
        dto.setContactViber(s.getContactViber());

        // --- N5Class fields ---
        if (s.getN5Class() != null) {
            dto.setN5ClassTeacher(s.getN5Class().getN5ClassTeacher());
            dto.setN5ClassAttendance(s.getN5Class().getN5ClassAttendance());
            dto.setN5ClassTestResult1(s.getN5Class().getN5ClassTestResult1());
            dto.setN5ClassTestResult2(s.getN5Class().getN5ClassTestResult2());
            dto.setN5ClassTestResult3(s.getN5Class().getN5ClassTestResult3());
            dto.setN5ClassTestResult4(s.getN5Class().getN5ClassTestResult4());
            dto.setN5ClassFeedback(s.getN5Class().getN5ClassFeedback());

            dto.setN5Class1Teacher(s.getN5Class().getN5Class1Teacher());
            dto.setN5Class1AttendanceRate(s.getN5Class().getN5Class1AttendanceRate());
            dto.setN5Class1TestResult(s.getN5Class().getN5Class1TestResult());
            dto.setN5Class1TeacherFeedback(s.getN5Class().getN5Class1TeacherFeedback());

            dto.setN5Class2Teacher(s.getN5Class().getN5Class2Teacher());
            dto.setN5Class2AttendanceRate(s.getN5Class().getN5Class2AttendanceRate());
            dto.setN5Class2TestResult(s.getN5Class().getN5Class2TestResult());
            dto.setN5Class2TeacherFeedback(s.getN5Class().getN5Class2TeacherFeedback());

            dto.setN5Class3Teacher(s.getN5Class().getN5Class3Teacher());
            dto.setN5Class3AttendanceRate(s.getN5Class().getN5Class3AttendanceRate());
            dto.setN5Class3TestResult(s.getN5Class().getN5Class3TestResult());
            dto.setN5Class3TeacherFeedback(s.getN5Class().getN5Class3TeacherFeedback());
        }

        // --- N4Class fields ---
        if (s.getN4Class() != null) {
            dto.setN4ClassTeacher(s.getN4Class().getN4ClassTeacher());
            dto.setN4ClassAttendance(s.getN4Class().getN4ClassAttendance());
            dto.setN4ClassTestResult1(s.getN4Class().getN4ClassTestResult1());
            dto.setN4ClassTestResult2(s.getN4Class().getN4ClassTestResult2());
            dto.setN4ClassTestResult3(s.getN4Class().getN4ClassTestResult3());
            dto.setN4ClassTestResult4(s.getN4Class().getN4ClassTestResult4());
            dto.setN4ClassFeedback(s.getN4Class().getN4ClassFeedback());

            dto.setN4Class1Teacher(s.getN4Class().getN4Class1Teacher());
            dto.setN4Class1AttendanceRate(s.getN4Class().getN4Class1AttendanceRate());
            dto.setN4Class1TestResult(s.getN4Class().getN4Class1TestResult());
            dto.setN4Class1TeacherFeedback(s.getN4Class().getN4Class1TeacherFeedback());

            dto.setN4Class2Teacher(s.getN4Class().getN4Class2Teacher());
            dto.setN4Class2AttendanceRate(s.getN4Class().getN4Class2AttendanceRate());
            dto.setN4Class2TestResult(s.getN4Class().getN4Class2TestResult());
            dto.setN4Class2TeacherFeedback(s.getN4Class().getN4Class2TeacherFeedback());

            dto.setN4Class3Teacher(s.getN4Class().getN4Class3Teacher());
            dto.setN4Class3AttendanceRate(s.getN4Class().getN4Class3AttendanceRate());
            dto.setN4Class3TestResult(s.getN4Class().getN4Class3TestResult());
            dto.setN4Class3TeacherFeedback(s.getN4Class().getN4Class3TeacherFeedback());
        }

        // --- InterviewNotes and JLPT ---
        if (s.getInterviewNotes() != null) {
            dto.setInterview1(s.getInterviewNotes().getInterview1());
            dto.setInterview2(s.getInterviewNotes().getInterview2());
            dto.setInterview3(s.getInterviewNotes().getInterview3());
        }

        return dto;
    }
}