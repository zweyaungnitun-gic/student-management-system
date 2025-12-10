package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.dto.StudentDTO;
import com.gicm.student_management_system.dto.N4ClassDTO; 
import com.gicm.student_management_system.dto.N5ClassDTO;

import com.gicm.student_management_system.entity.InterviewNotes;
import com.gicm.student_management_system.entity.N4Class;
import com.gicm.student_management_system.entity.N5Class;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.service.StudentService;
import com.gicm.student_management_system.service.N5ClassService;
import com.gicm.student_management_system.service.N4ClassService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.ui.Model;
import org.springframework.stereotype.Controller;

import java.time.LocalDate;
import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/students")
public class StudentController {

    private final StudentService studentService;
    private final N5ClassService n5ClassService;
    private final N4ClassService n4ClassService;

    @GetMapping
    public String getStudents(@RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            @RequestParam(value = "status", defaultValue = "") String status,
            Model model) {

        List<StudentDTO> students = studentService.getStudentsByFilter(nameSearch, status);

        model.addAttribute("students", students);
        model.addAttribute("nameSearch", nameSearch);
        model.addAttribute("statusFilter", status);

        return "students/student-list.html";
    }

    @GetMapping("/delete/{id}")
    public String deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return "redirect:/students"; // Redirect back to the student list
    }

    // NEW METHOD FOR DETAILS
    @GetMapping("/detail/{id}")
    public String showStudentDetails(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "personal") String tab,
            @RequestParam(required = false) String subTab,
            Model model) {

        // Fetch the specific student by ID
        //Student student = studentService.findById(id)
                //.orElseThrow(() -> new RuntimeException("Student not found: " + id));

        //Fetch Student DTO via Studentservice
        StudentDTO studentDTO = studentService.getStudentById(id);

        //Fetch N5 and N4 DTOs using the services
        N5ClassDTO n5Class = n5ClassService.getOrCreateN5ClassDTO(id);
        N4ClassDTO n4Class = n4ClassService.getOrCreateN4ClassDTO(id);

        // Map InterviewNotes Entity to InterviewNotesDTO for the view
        // Add attributes to model so details.html can display them
        model.addAttribute("student", studentDTO);
        model.addAttribute("n5Class", n5Class);
        model.addAttribute("n4Class", n4Class);

        model.addAttribute("currentTab", tab);
        model.addAttribute("currentSubTab", subTab);

        return "students/details";
    }

    // ----------------------------------------------------------------------------------------
    @GetMapping("/student-update/{id}")
    public String showUpdateForm(@PathVariable Long id, Model model) {

        Student student = studentService.findById(id)
                .orElseThrow(() -> new RuntimeException("生徒が見つかりません: ID " + id));

        if (student.getN5Class() == null) {
            N5Class n5Class = N5Class.builder()
                    .student(student)
                    .build();
            student.setN5Class(n5Class);
        }

        if (student.getN4Class() == null) {
            N4Class n4Class = N4Class.builder()
                    .student(student)
                    .build();
            student.setN4Class(n4Class);
        }

        if (student.getInterviewNotes() == null) {
            InterviewNotes interviewNotes = InterviewNotes.builder()
                    .student(student)
                    .build();
            student.setInterviewNotes(interviewNotes);
        }

        model.addAttribute("student", student);
        model.addAttribute("isNew", false);

        return "students/student-update.html";
    }

    @PostMapping("/update-basic/{id}")
    public String updateBasicInfo(@PathVariable Long id,
            @ModelAttribute Student student,
            RedirectAttributes redirectAttributes) {
        try {
            Student existingStudent = studentService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Student not found: " + id));

            existingStudent.setStudentName(student.getStudentName());
            existingStudent.setNameInJapanese(student.getNameInJapanese());
            existingStudent.setDateOfBirth(student.getDateOfBirth());
            existingStudent.setGender(student.getGender());
            existingStudent.setCurrentLivingAddress(student.getCurrentLivingAddress());
            existingStudent.setHomeTownAddress(student.getHomeTownAddress());
            existingStudent.setPhoneNumber(student.getPhoneNumber());
            existingStudent.setSecondaryPhone(student.getSecondaryPhone());
            existingStudent.setFatherName(student.getFatherName());
            existingStudent.setContactViber(student.getContactViber());
            existingStudent.setPassportNumber(student.getPassportNumber());
            existingStudent.setNationalID(student.getNationalID());

            existingStudent.setUpdatedAt(LocalDate.now());

            studentService.save(existingStudent);
            redirectAttributes.addFlashAttribute("success", "基本情報が正常に更新されました");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました: " + e.getMessage());
        }

        return "redirect:/students/student-update/" + id + "?tab=basic";
    }

    @PostMapping("/update-status/{id}")
    public String updateStatusInfo(@PathVariable Long id,
            @ModelAttribute Student student,
            RedirectAttributes redirectAttributes) {
        try {
            Student existingStudent = studentService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Student not found: " + id));

            existingStudent.setCurrentJapanLevel(student.getCurrentJapanLevel());
            existingStudent.setDesiredJobType(student.getDesiredJobType());
            existingStudent.setOtherDesiredJobType(student.getOtherDesiredJobType());
            existingStudent.setJapanTravelExperience(student.getJapanTravelExperience());
            existingStudent.setCoeApplicationExperience(student.getCoeApplicationExperience());
            existingStudent.setReligion(student.getReligion());
            existingStudent.setOtherReligion(student.getOtherReligion());
            existingStudent.setIsSmoking(student.getIsSmoking());
            existingStudent.setIsAlcoholDrink(student.getIsAlcoholDrink());
            existingStudent.setHaveTatto(student.getHaveTatto());
            existingStudent.setSchedulePaymentTutionDate(student.getSchedulePaymentTutionDate());
            existingStudent.setActualTutionPaymentDate(student.getActualTutionPaymentDate());
            existingStudent.setHostelPreference(student.getHostelPreference());
            existingStudent.setMemoNotes(student.getMemoNotes());
            existingStudent.setEnrolledDate(student.getEnrolledDate());
            existingStudent.setAttendingClassRelatedStatus(student.getAttendingClassRelatedStatus());
            existingStudent.setPassedHighestJLPTLevel(student.getPassedHighestJLPTLevel());
            existingStudent.setStatus(student.getStatus());
            existingStudent.setStudentId(student.getStudentId());

            existingStudent.setUpdatedAt(LocalDate.now());

            studentService.save(existingStudent);
            redirectAttributes.addFlashAttribute("success", "ステータス情報が正常に更新されました");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました: " + e.getMessage());
        }

        return "redirect:/students/student-update/" + id + "?tab=status";
    }

    @PostMapping("/update-n5/{id}")
    public String updateN5ClassInfo(@PathVariable Long id,
            @ModelAttribute N5Class n5Class,
            RedirectAttributes redirectAttributes) {
        try {
            Student student = studentService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Student not found: " + id));

            if (student.getN5Class() == null) {
                N5Class newN5Class = N5Class.builder()
                        .student(student)
                        .build();
                student.setN5Class(newN5Class);
            }

            N5Class existingN5Class = student.getN5Class();
            existingN5Class.setN5ClassTeacher(n5Class.getN5ClassTeacher());
            existingN5Class.setN5ClassAttendance(n5Class.getN5ClassAttendance());
            existingN5Class.setN5ClassTestResult1(n5Class.getN5ClassTestResult1());
            existingN5Class.setN5ClassTestResult2(n5Class.getN5ClassTestResult2());
            existingN5Class.setN5ClassTestResult3(n5Class.getN5ClassTestResult3());
            existingN5Class.setN5ClassTestResult4(n5Class.getN5ClassTestResult4());
            existingN5Class.setN5ClassFeedback(n5Class.getN5ClassFeedback());
            existingN5Class.setN5Class1Teacher(n5Class.getN5Class1Teacher());
            existingN5Class.setN5Class1AttendanceRate(n5Class.getN5Class1AttendanceRate());
            existingN5Class.setN5Class1TestResult(n5Class.getN5Class1TestResult());
            existingN5Class.setN5Class1TeacherFeedback(n5Class.getN5Class1TeacherFeedback());
            existingN5Class.setN5Class2Teacher(n5Class.getN5Class2Teacher());
            existingN5Class.setN5Class2AttendanceRate(n5Class.getN5Class2AttendanceRate());
            existingN5Class.setN5Class2TestResult(n5Class.getN5Class2TestResult());
            existingN5Class.setN5Class2TeacherFeedback(n5Class.getN5Class2TeacherFeedback());
            existingN5Class.setN5Class3Teacher(n5Class.getN5Class3Teacher());
            existingN5Class.setN5Class3AttendanceRate(n5Class.getN5Class3AttendanceRate());
            existingN5Class.setN5Class3TestResult(n5Class.getN5Class3TestResult());
            existingN5Class.setN5Class3TeacherFeedback(n5Class.getN5Class3TeacherFeedback());

            studentService.save(student);
            redirectAttributes.addFlashAttribute("success", "N5クラス情報が正常に更新されました");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました: " + e.getMessage());
        }

        return "redirect:/students/student-update/" + id + "?tab=n5";
    }

    @PostMapping("/update-n4/{id}")
    public String updateN4ClassInfo(@PathVariable Long id,
            @ModelAttribute N4Class n4Class,
            RedirectAttributes redirectAttributes) {
        try {
            Student student = studentService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Student not found: " + id));

            if (student.getN4Class() == null) {
                N4Class newN4Class = N4Class.builder()
                        .student(student)
                        .build();
                student.setN4Class(newN4Class);
            }

            N4Class existingN4Class = student.getN4Class();
            existingN4Class.setN4ClassTeacher(n4Class.getN4ClassTeacher());
            existingN4Class.setN4ClassAttendance(n4Class.getN4ClassAttendance());
            existingN4Class.setN4ClassTestResult1(n4Class.getN4ClassTestResult1());
            existingN4Class.setN4ClassTestResult2(n4Class.getN4ClassTestResult2());
            existingN4Class.setN4ClassTestResult3(n4Class.getN4ClassTestResult3());
            existingN4Class.setN4ClassTestResult4(n4Class.getN4ClassTestResult4());
            existingN4Class.setN4ClassFeedback(n4Class.getN4ClassFeedback());
            existingN4Class.setN4Class1Teacher(n4Class.getN4Class1Teacher());
            existingN4Class.setN4Class1AttendanceRate(n4Class.getN4Class1AttendanceRate());
            existingN4Class.setN4Class1TestResult(n4Class.getN4Class1TestResult());
            existingN4Class.setN4Class1TeacherFeedback(n4Class.getN4Class1TeacherFeedback());
            existingN4Class.setN4Class2Teacher(n4Class.getN4Class2Teacher());
            existingN4Class.setN4Class2AttendanceRate(n4Class.getN4Class2AttendanceRate());
            existingN4Class.setN4Class2TestResult(n4Class.getN4Class2TestResult());
            existingN4Class.setN4Class2TeacherFeedback(n4Class.getN4Class2TeacherFeedback());
            existingN4Class.setN4Class3Teacher(n4Class.getN4Class3Teacher());
            existingN4Class.setN4Class3AttendanceRate(n4Class.getN4Class3AttendanceRate());
            existingN4Class.setN4Class3TestResult(n4Class.getN4Class3TestResult());
            existingN4Class.setN4Class3TeacherFeedback(n4Class.getN4Class3TeacherFeedback());

            studentService.save(student);
            redirectAttributes.addFlashAttribute("success", "N4クラス情報が正常に更新されました");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました: " + e.getMessage());
        }

        return "redirect:/students/student-update/" + id + "?tab=n4";
    }

    @PostMapping("/update-interview/{id}")
    public String updateInterviewNotes(@PathVariable Long id,
            @ModelAttribute InterviewNotes interviewNotes,
            RedirectAttributes redirectAttributes) {
        try {
            Student student = studentService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Student not found: " + id));

            if (student.getInterviewNotes() == null) {
                InterviewNotes newInterviewNotes = InterviewNotes.builder()
                        .student(student)
                        .build();
                student.setInterviewNotes(newInterviewNotes);
            }

            InterviewNotes existingInterviewNotes = student.getInterviewNotes();
            existingInterviewNotes.setInterview1(interviewNotes.getInterview1());
            existingInterviewNotes.setInterview2(interviewNotes.getInterview2());
            existingInterviewNotes.setInterview3(interviewNotes.getInterview3());
            existingInterviewNotes.setOtherMemo(interviewNotes.getOtherMemo());

            studentService.save(student);
            redirectAttributes.addFlashAttribute("success", "面談情報が正常に更新されました");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました: " + e.getMessage());
        }

        return "redirect:/students/student-update/" + id + "?tab=interview";
    }
    // ---------------------------------------------------------------------------------------------
}