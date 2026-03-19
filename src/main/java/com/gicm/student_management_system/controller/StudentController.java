package com.gicm.student_management_system.controller;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
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
import com.gicm.student_management_system.dto.StudentDTO;
import com.gicm.student_management_system.dto.StudentFullExportDTO;
import com.gicm.student_management_system.dto.StudentRegistrationDTO;
import com.gicm.student_management_system.entity.RegistrationStatus;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.entity.StudentRegistration;
import com.gicm.student_management_system.enums.Religion;
import com.gicm.student_management_system.service.InterviewNotesService;
import com.gicm.student_management_system.service.StudentRegistrationService;
import com.gicm.student_management_system.service.StudentExportService;
import com.gicm.student_management_system.service.StudentService;
import com.gicm.student_management_system.validation.BasicInfoGroup;

import jakarta.servlet.http.HttpServletRequest;
import java.security.Principal;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/students")
public class StudentController {

    private final StudentService studentService;
    private final StudentExportService studentExportService;
    private final InterviewNotesService interviewNotesService;
    private final StudentRegistrationService studentRegistrationService;

    // ---- UI METHODS ----
    @GetMapping
    public String getStudents(@RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            @RequestParam(value = "status", defaultValue = "") String status,
            Model model) {

        List<StudentDTO> students;

        // Student no longer has a 'status' column; keep name search only.
        if (nameSearch.isBlank()) {
            students = studentService.getAllStudents();
        } else {
            students = studentService.getStudentsByFilter(nameSearch);
        }

        // --- Keep your sorting logic exactly as it is ---
        students.sort((s1, s2) -> {
            if (s1.getStudentId() == null && s2.getStudentId() == null)
                return 0;
            if (s1.getStudentId() == null)
                return 1;
            if (s2.getStudentId() == null)
                return -1;
            String id1 = s1.getStudentId();
            String id2 = s2.getStudentId();
            try {
                int num1 = extractNumberFromStudentId(id1);
                int num2 = extractNumberFromStudentId(id2);
                return Integer.compare(num1, num2);
            } catch (Exception e) {
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
        try {
            StringBuilder url = new StringBuilder("redirect:/students");
            List<String> params = new ArrayList<>();

            if (nameSearch != null && !nameSearch.trim().isEmpty()) {
                params.add("nameSearch=" + URLEncoder.encode(nameSearch.trim(), StandardCharsets.UTF_8));
            }
            if (status != null && !status.trim().isEmpty()) {
                params.add("status=" + URLEncoder.encode(status.trim(), StandardCharsets.UTF_8));
            }

            if (!params.isEmpty()) {
                url.append("?").append(String.join("&", params));
            }

            return url.toString();
        } catch (Exception e) {
            // Fallback to simple redirect if encoding fails
            return "redirect:/students";
        }
    }

    // METHOD FOR DETAILS
    @GetMapping("/detail/{id}")
    public String showStudentDetails(@PathVariable Long id,
            @RequestParam(required = false, defaultValue = "personal") String tab,
            @RequestParam(required = false) String subTab,
            @RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            // Rename this to filterStatus in the method signature
            @RequestParam(value = "status", defaultValue = "") String filterStatus,
            Model model) {

        Student student = studentService.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found: " + id));

        model.addAttribute("student", student);
        // Fetch Student DTO via Studentservice
        StudentDTO studentDTO = studentService.getStudentById(id);

        InterviewNotesDTO interviewNotes = interviewNotesService.getOrCreateInterviewNotesDTO(id);

        String religionLabel = Religion.getLabelFromValue(studentDTO.getReligion());
        model.addAttribute("religionDisplay", religionLabel);

        // Map InterviewNotes Entity to InterviewNotesDTO for the view
        // Add attributes to model so details.html can display them
        model.addAttribute("student", studentDTO);
        model.addAttribute("interviewNotes", interviewNotes);
        model.addAttribute("nameSearch", nameSearch);
        model.addAttribute("status", filterStatus);

        // model.addAttribute("student", student);
        model.addAttribute("currentTab", tab);
        model.addAttribute("currentSubTab", subTab);

        return "students/student-details";
    }

    // ----------------------------------------------------------------------------------------
    // Student Update
    // ----------------------------------------------------------------------------------------
    @PostMapping("/create")
    public String createStudent(@Validated @ModelAttribute StudentDTO studentDTO,
            BindingResult bindingResult,
            RedirectAttributes redirectAttributes) {

        if (bindingResult.hasErrors()) {
            return "students/student-form";
        }

        // Let the service generate the student ID
        studentDTO.setStudentId(null); // Clear any ID to let service generate

        StudentDTO created = studentService.createStudent(studentDTO);

        redirectAttributes.addFlashAttribute("success",
                "生徒が作成されました。生徒ID: " + created.getStudentId());

        return "redirect:/students";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/student-update/{id}")
    public String showUpdateForm(@PathVariable Long id,
            @RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            @RequestParam(value = "status", defaultValue = "") String status,
            Model model) {
        Student student = studentService.findById(id)
                .orElseThrow(() -> new RuntimeException("生徒が見つかりません: ID " + id));

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

        if (student.getNationalId() != null && !student.getNationalId().isEmpty()) {
            if (studentService.isNationalIdDuplicate(student.getNationalId(), id)) {
                bindingResult.rejectValue("nationalId", "error.duplicate", "この国民IDは既に登録されています。");
            }
        }

        if (bindingResult.hasErrors()) {
            return "students/student-update.html";
        }

        Student existingStudent = studentService.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found: " + id));

        existingStudent.setStudentName(student.getStudentName());
        existingStudent.setDateOfBirth(student.getDateOfBirth());
        existingStudent.setGender(student.getGender());
        existingStudent.setCurrentLivingAddress(student.getCurrentLivingAddress());
        existingStudent.setHomeTownAddress(student.getHomeTownAddress());
        existingStudent.setPhoneNumber(student.getPhoneNumber());
        existingStudent.setNationalId(student.getNationalId());
        existingStudent.setReligion(student.getReligion());
        existingStudent.setEnrolledDate(student.getEnrolledDate());
        existingStudent.setUpdatedAt(LocalDate.now());
        // existingStudent.setEnrolledDate(LocalDate.now());

        studentService.save(existingStudent);

        redirectAttributes.addFlashAttribute("success", "基本情報が正常に更新されました。");

        return buildUpdateRedirectUrl(id, "basic", nameSearch, status);
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
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/export")
    @ResponseBody
    public List<StudentFullExportDTO> getStudentsExport(
            @RequestParam(value = "ids", required = false) List<Long> ids,
            @RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            @RequestParam(value = "status", defaultValue = "") String status) {

        if (ids != null && !ids.isEmpty()) {
            return studentExportService.getStudentsByIds(ids);
        }
        return studentExportService.getAllStudentsFull(nameSearch);
    }

    // Helper method to build redirect URL with proper encoding for Japanese
    // characters

    private String buildUpdateRedirectUrl(Long id, String tab, String nameSearch, String status) {
        try {
            StringBuilder url = new StringBuilder("redirect:/students/student-update/");
            url.append(id).append("?tab=").append(tab);

            // 1. Only keep nameSearch if it actually had a value
            if (nameSearch != null && !nameSearch.trim().isEmpty()) {
                url.append("&nameSearch=").append(URLEncoder.encode(nameSearch.trim(), StandardCharsets.UTF_8));
            }

            /*
             * 2. THE FIX:
             * Only append 'status' to the URL if it was part of a SEARCH.
             * If the user just updated a student's status but wasn't
             * filtering the list by that status before, we leave it empty.
             */
            if (status != null && !status.trim().isEmpty()) {
                // We check if the 'status' passed here is actually a filter context
                // or just the student's new status.
                url.append("&status=").append(URLEncoder.encode(status.trim(), StandardCharsets.UTF_8));
            }

            return url.toString();
        } catch (Exception e) {
            return "redirect:/students/student-update/" + id + "?tab=" + tab;
        }
    }

    // ----------------------------------------------------------------------------------------
    // Registration List (Admin) - Accept / Reject
    // ----------------------------------------------------------------------------------------
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/registrations")
    public String listRegistrations(
            @RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            @RequestParam(value = "registrationStatus", defaultValue = "PENDING") String registrationStatus,
            Model model) {
        RegistrationStatus status = RegistrationStatus.valueOf(registrationStatus);
        List<StudentRegistration> registrations = studentRegistrationService.listRegistrations(status, nameSearch);
        model.addAttribute("registrations", registrations);
        model.addAttribute("nameSearch", nameSearch);
        model.addAttribute("registrationStatus", status.name());
        return "students/registration-list";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/registrations/{id}")
    public String registrationDetail(@PathVariable Long id, Model model) {
        StudentRegistration reg = studentRegistrationService.getRegistration(id);
        model.addAttribute("reg", reg);
        return "students/registration-detail";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/registrations/{id}/edit")
    public String registrationEdit(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        StudentRegistration reg = studentRegistrationService.getRegistration(id);
        if (reg.getRegistrationStatus() != RegistrationStatus.PENDING) {
            redirectAttributes.addFlashAttribute("error", "処理済みの申請は編集できません");
            return "redirect:/students/registrations/" + id;
        }

        StudentRegistrationDTO dto = new StudentRegistrationDTO();
        dto.setEnglishName(reg.getEnglishName());
        dto.setKatakanaName(reg.getKatakanaName());
        dto.setDob(reg.getDateOfBirth() == null ? null : reg.getDateOfBirth().toString());
        dto.setGender(reg.getGender());
        dto.setCurrentAddress(reg.getCurrentAddress());
        dto.setHometownAddress(reg.getHometownAddress());
        dto.setPhoneNumber(reg.getPhoneNumber());
        dto.setGuardianPhoneNumber(reg.getGuardianPhoneNumber());
        dto.setFatherName(reg.getFatherName());
        dto.setPassportNumber(reg.getPassportNumber());
        dto.setNationalIdNumber(reg.getNationalIdNumber());
        dto.setJlptLevel(reg.getJlptLevel());
        dto.setDesiredOccupation(reg.getDesiredOccupation());
        dto.setOtherOccupation(reg.getOtherOccupation());
        dto.setJapanTravelExperience(reg.getJapanTravelExperience());
        dto.setCoeApplicationExperience(reg.getCoeApplicationExperience());
        dto.setReligion(reg.getReligion());
        dto.setOtherReligion(reg.getOtherReligion());
        dto.setSmoking(reg.getSmoking());
        dto.setAlcohol(reg.getAlcohol());
        dto.setTattoo(reg.getTattoo());
        dto.setTuitionPaymentDate(reg.getTuitionPaymentDate() == null ? null : reg.getTuitionPaymentDate().toString());
        dto.setWantDorm(reg.getWantDorm());
        dto.setOtherMemo(reg.getOtherMemo());

        model.addAttribute("reg", reg);
        model.addAttribute("registration", dto);
        return "students/registration-edit";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/registrations/{id}/update")
    public String registrationUpdate(
            @PathVariable Long id,
            @ModelAttribute("registration") StudentRegistrationDTO dto,
            RedirectAttributes redirectAttributes) {
        studentRegistrationService.updateRegistration(id, dto);
        redirectAttributes.addFlashAttribute("success", "申請内容を更新しました。");
        return "redirect:/students/registrations/" + id;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/registrations/{id}/delete")
    public String registrationDelete(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        studentRegistrationService.deleteRegistration(id);
        redirectAttributes.addFlashAttribute("success", "申請を削除しました。");
        return "redirect:/students/registrations?registrationStatus=PENDING";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/registrations/{id}/accept")
    public String acceptRegistration(
            @PathVariable Long id,
            Principal principal,
            RedirectAttributes redirectAttributes) {
        studentRegistrationService.acceptRegistration(id, principal != null ? principal.getName() : "admin");
        redirectAttributes.addFlashAttribute("success", "登録を承認しました。");
        return "redirect:/students/registrations?registrationStatus=PENDING";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/registrations/{id}/reject")
    public String rejectRegistration(
            @PathVariable Long id,
            Principal principal,
            RedirectAttributes redirectAttributes) {
        studentRegistrationService.rejectRegistration(id, principal != null ? principal.getName() : "admin");
        redirectAttributes.addFlashAttribute("success", "登録を却下しました。");
        return "redirect:/students/registrations?registrationStatus=PENDING";
    }
}