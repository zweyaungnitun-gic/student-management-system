package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.dto.N4ClassDTO;
import com.gicm.student_management_system.dto.N5ClassDTO;
import com.gicm.student_management_system.dto.StudentDTO;
import com.gicm.student_management_system.dto.StudentFullExportDTO;
import com.gicm.student_management_system.dto.InterviewNotesDTO;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.service.N5ClassService;
import com.gicm.student_management_system.service.N4ClassService;
import com.gicm.student_management_system.service.StudentService;

import jakarta.validation.Valid;
import com.gicm.student_management_system.service.InterviewNotesService;

import com.gicm.student_management_system.service.StudentExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.validation.BindingResult;
import java.util.ArrayList;
import java.util.Arrays;
import java.time.LocalDate;
import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/students")
public class StudentController {

    private final StudentService studentService;
    private final StudentExportService studentExportService;
    private final N5ClassService n5ClassService;
    private final N4ClassService n4ClassService;
    private final InterviewNotesService interviewNotesService;

    // ---- UI METHODS ----
    @GetMapping
    public String getStudents(@RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            @RequestParam(value = "status", defaultValue = "") String status,
            Model model) {

        // Split comma-separated statuses
        List<String> statuses = new ArrayList<>();
        if (!status.isBlank()) {
            statuses = Arrays.asList(status.split(","));
        }

        // Call new service method that supports multi-status
        List<StudentDTO> students = studentService.getStudentsByStatuses(nameSearch, statuses);

        model.addAttribute("students", students);
        model.addAttribute("nameSearch", nameSearch);
        model.addAttribute("statusFilter", status);
        return "students/student-list.html";
    }

    @GetMapping("/delete/{id}")
    public String deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return "redirect:/students";
    }

    // METHOD FOR DETAILS
    @GetMapping("/detail/{id}")
    public String showStudentDetails(@PathVariable Long id,
            @RequestParam(required = false, defaultValue = "personal") String tab,
            @RequestParam(required = false) String subTab,
            Model model) {

        Student student = studentService.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found: " + id));

        model.addAttribute("student", student);
        // Fetch Student DTO via Studentservice
        StudentDTO studentDTO = studentService.getStudentById(id);

        // Fetch N5 and N4 DTOs using the services
        N5ClassDTO n5Class = n5ClassService.getOrCreateN5ClassDTO(id);
        N4ClassDTO n4Class = n4ClassService.getOrCreateN4ClassDTO(id);

        InterviewNotesDTO interviewNotes = interviewNotesService.getOrCreateInterviewNotesDTO(id);

        // Map InterviewNotes Entity to InterviewNotesDTO for the view
        // Add attributes to model so details.html can display them
        model.addAttribute("student", studentDTO);
        model.addAttribute("n5Class", n5Class);
        model.addAttribute("n4Class", n4Class);
        model.addAttribute("interviewNotes", interviewNotes);

        // model.addAttribute("student", student);
        model.addAttribute("currentTab", tab);
        model.addAttribute("currentSubTab", subTab);

        return "students/student-details";
    }

    // ----------------------------------------------------------------------------------------
    // Student Update
    // ----------------------------------------------------------------------------------------

    @GetMapping("/student-update/{id}")
    public String showUpdateForm(@PathVariable Long id, Model model) {
        Student student = studentService.findById(id)
                .orElseThrow(() -> new RuntimeException("生徒が見つかりません: ID " + id));

        N5ClassDTO n5ClassDTO = n5ClassService.getOrCreateN5ClassDTO(id);
        model.addAttribute("n5Class", n5ClassDTO);

        N4ClassDTO n4ClassDTO = n4ClassService.getOrCreateN4ClassDTO(id);
        model.addAttribute("n4Class", n4ClassDTO);

        InterviewNotesDTO interviewNotesDTO = interviewNotesService.getOrCreateInterviewNotesDTO(id);
        model.addAttribute("interviewNotes", interviewNotesDTO);

        model.addAttribute("student", student);
        model.addAttribute("isNew", false);

        return "students/student-update.html";
    }

    @PostMapping("/update-basic/{id}")
    public String updateBasicInfo(
            @PathVariable Long id,
            @Valid @ModelAttribute("student") Student student,
            BindingResult bindingResult,
            RedirectAttributes redirectAttributes,
            Model model) {

        if (bindingResult.hasErrors()) {
            model.addAttribute("student", student);
            model.addAttribute("validationError", true);
            return "students/student-update.html?tab=basic";
        }

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
        redirectAttributes.addFlashAttribute("success", "基本情報が正常に更新されました。");

        // redirectAttributes.addFlashAttribute("error", "更新に失敗しました: " +
        // e.getMessage());

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
            redirectAttributes.addFlashAttribute("success", "ステータス情報が正常に更新されました。");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました: " + e.getMessage());
        }

        return "redirect:/students/student-update/" + id + "?tab=status";
    }

    @PostMapping("/update-n5/{id}")
    public String updateN5ClassInfo(@PathVariable Long id,
            @ModelAttribute("n5Class") N5ClassDTO n5ClassDTO,
            RedirectAttributes redirectAttributes) {
        try {
            n5ClassService.saveN5ClassDTO(id, n5ClassDTO);

            redirectAttributes.addFlashAttribute("success", "N5クラス情報が正常に更新されました。");
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました: " + e.getMessage());
        }

        return "redirect:/students/student-update/" + id + "?tab=n5";
    }

    @PostMapping("/update-n4/{id}")
    public String updateN4ClassInfo(@PathVariable Long id,
            @ModelAttribute("n4Class") N4ClassDTO n4ClassDTO,
            RedirectAttributes redirectAttributes) {
        try {

            n4ClassService.saveN4ClassDTO(id, n4ClassDTO);
            redirectAttributes.addFlashAttribute("success", "N4クラス情報が正常に更新されました。");
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました: " + e.getMessage());
        }

        return "redirect:/students/student-update/" + id + "?tab=n4";
    }

    @PostMapping("/update-interview/{id}")
    public String updateInterviewNotes(@PathVariable Long id,
            @ModelAttribute("interviewNotes") InterviewNotesDTO interviewNotesDTO,
            RedirectAttributes redirectAttributes) {
        try {
            interviewNotesService.saveInterviewNotesDTO(id, interviewNotesDTO);
            redirectAttributes.addFlashAttribute("success", "面談情報が正常に更新されました。");
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました: " + e.getMessage());
        }

        return "redirect:/students/student-update/" + id + "?tab=interview";
    }

    // ------------------------------------------------------------------------------------
    // ---- JSON API FOR FRONTEND CSV ----
    @RestController
    @RequestMapping("/students/export")
    @RequiredArgsConstructor
    public static class StudentExportController {

        private final StudentExportService studentExportService;

        @GetMapping
        public List<StudentFullExportDTO> getStudentsExport(
                @RequestParam(value = "ids", required = false) List<Long> ids,
                @RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
                @RequestParam(value = "status", defaultValue = "") String status) {

            if (ids != null && !ids.isEmpty()) {
                return studentExportService.getStudentsByIds(ids);
            } else {
                return studentExportService.getAllStudentsFull(nameSearch, status);
            }
        }
    }
}
