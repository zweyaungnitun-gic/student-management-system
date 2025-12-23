package com.gicm.student_management_system.controller;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.gicm.student_management_system.dto.InterviewNotesDTO;
import com.gicm.student_management_system.dto.N4ClassDTO;
import com.gicm.student_management_system.dto.N5ClassDTO;
import com.gicm.student_management_system.dto.StudentDTO;
import com.gicm.student_management_system.dto.StudentFullExportDTO;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.service.InterviewNotesService;
import com.gicm.student_management_system.service.N4ClassService;
import com.gicm.student_management_system.service.N5ClassService;
import com.gicm.student_management_system.service.StudentExportService;
import com.gicm.student_management_system.service.StudentService;
import com.gicm.student_management_system.validation.BasicInfoGroup;
import com.gicm.student_management_system.validation.StatusGroup;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

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

        List<String> statuses = new ArrayList<>();
        if (!status.isBlank()) {
            statuses = Arrays.asList(status.split(","));
        }

        List<StudentDTO> students = studentService.getStudentsByStatuses(nameSearch, statuses);

        // Better sorting for Student IDs (STU001, STU002, etc.)
        students.sort((s1, s2) -> {
            // Handle null student IDs
            if (s1.getStudentId() == null && s2.getStudentId() == null)
                return 0;
            if (s1.getStudentId() == null)
                return 1;
            if (s2.getStudentId() == null)
                return -1;

            // Extract numeric part from student ID (e.g., "STU004" -> 4)
            String id1 = s1.getStudentId();
            String id2 = s2.getStudentId();

            try {
                int num1 = extractNumberFromStudentId(id1);
                int num2 = extractNumberFromStudentId(id2);
                return Integer.compare(num1, num2);
            } catch (Exception e) {
                // Fallback to string comparison
                return id1.compareTo(id2);
            }
        });

        model.addAttribute("students", students);
        model.addAttribute("nameSearch", nameSearch);
        model.addAttribute("status", status);

        return "students/student-list";
    }

    // Helper method for extracting number from Student ID
    private int extractNumberFromStudentId(String studentId) {
        if (studentId == null || studentId.isEmpty())
            return 0;

        // Extract numeric part from strings like "STU001" or "STU004"
        String numericPart = studentId.replaceAll("[^0-9]", "");
        if (numericPart.isEmpty())
            return 0;
        return Integer.parseInt(numericPart);
    }

    // KZT
    // 181225
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/delete/{id}")
    public String deleteStudent(@PathVariable Long id,
            @RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            @RequestParam(value = "status", defaultValue = "") String status) {
        studentService.deleteStudent(id);
        return buildRedirectUrl(nameSearch, status);
    }

    private String buildRedirectUrl(String nameSearch, String status) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'buildRedirectUrl'");
    }

    // METHOD FOR DETAILS
    @GetMapping("/detail/{id}")
    public String showStudentDetails(@PathVariable Long id,
            @RequestParam(required = false, defaultValue = "personal") String tab,
            @RequestParam(required = false) String subTab,
            @RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            @RequestParam(value = "status", defaultValue = "") String status,
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
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/student-update/{id}")
    public String showUpdateForm(@PathVariable Long id,
            @RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            @RequestParam(value = "status", defaultValue = "") String status,
            Model model) {
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

        model.addAttribute("nameSearch", nameSearch);
        model.addAttribute("status", status);

        return "students/student-update.html";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/update-basic/{id}")
    public String updateBasicInfo(
            @PathVariable Long id,
            @Validated(BasicInfoGroup.class) @ModelAttribute("student") Student student,
            BindingResult bindingResult,
            RedirectAttributes redirectAttributes,
            Model model,
            @RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            @RequestParam(value = "status", defaultValue = "") String status,
            HttpServletRequest request) {

        if (bindingResult.hasErrors()) {
            Student existingStudent = studentService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Student not found: " + id));

            N5ClassDTO n5ClassDTO = n5ClassService.getOrCreateN5ClassDTO(id);
            model.addAttribute("n5Class", n5ClassDTO);

            N4ClassDTO n4ClassDTO = n4ClassService.getOrCreateN4ClassDTO(id);
            model.addAttribute("n4Class", n4ClassDTO);

            InterviewNotesDTO interviewNotesDTO = interviewNotesService.getOrCreateInterviewNotesDTO(id);
            model.addAttribute("interviewNotes", interviewNotesDTO);

            model.addAttribute("student", student);
            model.addAttribute("isNew", false);
            model.addAttribute("nameSearch", nameSearch);
            model.addAttribute("status", status);
            model.addAttribute("activeTab", "basic");

            model.addAttribute("activeTab", "basic");
            return "students/student-update.html";
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

        return buildUpdateRedirectUrl(id, "basic", nameSearch, status);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/update-status/{id}")
    public String updateStatusInfo(@PathVariable Long id,
            @Validated(StatusGroup.class) @ModelAttribute Student student,
            BindingResult bindingResult,
            RedirectAttributes redirectAttributes,
            Model model,
            @RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            @RequestParam(value = "status", defaultValue = "") String status) {

        if (bindingResult.hasErrors()) {
            model.addAttribute("activeTab", "status");
            return "students/student-update.html";
        }

        try {
            Student existingStudent = studentService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Student not found: " + id));

            N5ClassDTO n5ClassDTO = n5ClassService.getOrCreateN5ClassDTO(id);
            model.addAttribute("n5Class", n5ClassDTO);

            N4ClassDTO n4ClassDTO = n4ClassService.getOrCreateN4ClassDTO(id);
            model.addAttribute("n4Class", n4ClassDTO);

            InterviewNotesDTO interviewNotesDTO = interviewNotesService.getOrCreateInterviewNotesDTO(id);
            model.addAttribute("interviewNotes", interviewNotesDTO);

            model.addAttribute("student", student);
            model.addAttribute("isNew", false);
            model.addAttribute("nameSearch", nameSearch);
            model.addAttribute("status", status);
            model.addAttribute("activeTab", "status");

            existingStudent.setStatus(student.getStatus());
            existingStudent.setDesiredJobType(student.getDesiredJobType());
            existingStudent.setOtherDesiredJobType(student.getOtherDesiredJobType());
            existingStudent.setReligion(student.getReligion());
            existingStudent.setOtherReligion(student.getOtherReligion());
            existingStudent.setEnrolledDate(student.getEnrolledDate());
            existingStudent.setAttendingClassRelatedStatus(student.getAttendingClassRelatedStatus());
            existingStudent.setPassedHighestJLPTLevel(student.getPassedHighestJLPTLevel());
            existingStudent.setUpdatedAt(LocalDate.now());

            studentService.save(existingStudent);
            redirectAttributes.addFlashAttribute("success", "ステータス情報が正常に更新されました。");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました: " + e.getMessage());
        }

        return buildUpdateRedirectUrl(id, "status", nameSearch, status);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/update-n5/{id}")
    public String updateN5ClassInfo(@PathVariable Long id,
            @ModelAttribute("n5Class") N5ClassDTO n5ClassDTO,
            @RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            @RequestParam(value = "status", defaultValue = "") String status,
            RedirectAttributes redirectAttributes) {
        try {
            n5ClassService.saveN5ClassDTO(id, n5ClassDTO);
            redirectAttributes.addFlashAttribute("success", "N5クラス情報が正常に更新されました。");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました: " + e.getMessage());
        }
        return buildUpdateRedirectUrl(id, "n5", nameSearch, status);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/update-n4/{id}")
    public String updateN4ClassInfo(@PathVariable Long id,
            @ModelAttribute("n4Class") N4ClassDTO n4ClassDTO,
            @RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            @RequestParam(value = "status", defaultValue = "") String status,
            RedirectAttributes redirectAttributes) {
        try {
            n4ClassService.saveN4ClassDTO(id, n4ClassDTO);
            redirectAttributes.addFlashAttribute("success", "N4クラス情報が正常に更新されました。");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました。");
        }
        return buildUpdateRedirectUrl(id, "n4", nameSearch, status);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/update-interview/{id}")
    public String updateInterviewNotes(@PathVariable Long id,
            @ModelAttribute("interviewNotes") InterviewNotesDTO interviewNotesDTO,
            @RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            @RequestParam(value = "status", defaultValue = "") String status,
            RedirectAttributes redirectAttributes) {
        try {
            interviewNotesService.saveInterviewNotesDTO(id, interviewNotesDTO);
            redirectAttributes.addFlashAttribute("success", "面談情報が正常に更新されました。");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました。");
        }
        return buildUpdateRedirectUrl(id, "interview", nameSearch, status);
    }

    // KZT
    // 181225
    @GetMapping("/export")
    @ResponseBody
    public List<StudentFullExportDTO> getStudentsExport(
            @RequestParam(value = "ids", required = false) List<Long> ids,
            @RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            @RequestParam(value = "status", defaultValue = "") String status) {

        if (ids != null && !ids.isEmpty()) {
            return studentExportService.getStudentsByIds(ids);
        }
        return studentExportService.getAllStudentsFull(nameSearch, status);
    }

    // Helper method to build redirect URL with proper encoding for Japanese
    // characters

    // Updated helper to redirect back to the UPDATE page with all context
    private String buildUpdateRedirectUrl(Long id, String tab, String nameSearch, String status) {
        try {
            StringBuilder url = new StringBuilder("redirect:/students/student-update/");
            url.append(id).append("?tab=").append(tab);

            if (nameSearch != null && !nameSearch.trim().isEmpty()) {
                url.append("&nameSearch=").append(URLEncoder.encode(nameSearch.trim(), StandardCharsets.UTF_8));
            }
            if (status != null && !status.trim().isEmpty()) {
                url.append("&status=").append(URLEncoder.encode(status.trim(), StandardCharsets.UTF_8));
            }

            return url.toString();
        } catch (Exception e) {
            // Fallback if encoding fails
            return "redirect:/students/student-update/" + id + "?tab=" + tab;
        }
    }
}