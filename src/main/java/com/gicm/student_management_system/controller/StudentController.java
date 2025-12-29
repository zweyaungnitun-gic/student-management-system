package com.gicm.student_management_system.controller;

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
import com.gicm.student_management_system.enums.YesNoDisplay;
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

        List<StudentDTO> students;

        // CHECK: If both are empty, it's the "Original Display" (Home) view
        if (nameSearch.isBlank() && status.isBlank()) {
            // Fetch everyone without filters
            students = studentService.getAllStudents();
        } else {
            // Fetch based on filters
            List<String> statuses = new ArrayList<>();
            if (!status.isBlank()) {
                statuses = Arrays.asList(status.split(","));
            }
            students = studentService.getStudentsByStatuses(nameSearch, statuses);
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

        // Fetch N5 and N4 DTOs using the services
        N5ClassDTO n5Class = n5ClassService.getOrCreateN5ClassDTO(id);
        N4ClassDTO n4Class = n4ClassService.getOrCreateN4ClassDTO(id);

        InterviewNotesDTO interviewNotes = interviewNotesService.getOrCreateInterviewNotesDTO(id);

        model.addAttribute("japanTravelExperienceDisplay",
                YesNoDisplay.from(studentDTO.getJapanTravelExperience()));

        model.addAttribute("coeApplicationExperienceDisplay",
                YesNoDisplay.from(studentDTO.getCoeApplicationExperience()));

        model.addAttribute("isSmokingDisplay",
                YesNoDisplay.from(studentDTO.getIsSmoking()));

        model.addAttribute("isAlcoholDrinkDisplay",
                YesNoDisplay.from(studentDTO.getIsAlcoholDrink()));

        model.addAttribute("haveTattoDisplay",
                YesNoDisplay.from(studentDTO.getHaveTatto()));

        model.addAttribute("hostelPreferenceDisplay",
                YesNoDisplay.from(studentDTO.getHostelPreference()));

        // Map InterviewNotes Entity to InterviewNotesDTO for the view
        // Add attributes to model so details.html can display them
        model.addAttribute("student", studentDTO);
        model.addAttribute("n5Class", n5Class);
        model.addAttribute("n4Class", n4Class);
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
    public String updateStatusInfo(
            @PathVariable Long id,
            @Validated(StatusGroup.class) @ModelAttribute("student") Student student,
            BindingResult bindingResult,
            RedirectAttributes redirectAttributes,
            Model model,
            @RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            // Ensure this comes from the hidden input 'filterStatus'
            @RequestParam(value = "filterStatus", defaultValue = "") String filterStatus) {

        // --- ADD THE DEBUG LINE HERE ---
        System.out.println("DEBUG: Student ID from Path: " + id);
        System.out.println("DEBUG: Status received from Form: " + student.getStatus());
        System.out.println("DEBUG: Has Errors? " + bindingResult.hasErrors());
        // -------------------------------

        if (bindingResult.hasErrors()) {
            // If validation fails, we must reload the class DTOs for the UI to show the
            // tabs correctly
            N5ClassDTO n5ClassDTO = n5ClassService.getOrCreateN5ClassDTO(id);
            N4ClassDTO n4ClassDTO = n4ClassService.getOrCreateN4ClassDTO(id);
            InterviewNotesDTO interviewNotesDTO = interviewNotesService.getOrCreateInterviewNotesDTO(id);

            model.addAttribute("n5Class", n5ClassDTO);
            model.addAttribute("n4Class", n4ClassDTO);
            model.addAttribute("interviewNotes", interviewNotesDTO);
            model.addAttribute("activeTab", "status");
            return "students/student-update.html";
        }

        try {
            // 1. Fetch the REAL entity from DB
            Student existingStudent = studentService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Student not found: " + id));

            // 2. Manually map ONLY the status-related fields from the form object
            existingStudent.setStatus(student.getStatus());
            existingStudent.setDesiredJobType(student.getDesiredJobType());
            existingStudent.setOtherDesiredJobType(student.getOtherDesiredJobType());
            existingStudent.setReligion(student.getReligion());
            existingStudent.setOtherReligion(student.getOtherReligion());
            existingStudent.setCurrentJapanLevel(student.getCurrentJapanLevel());
            existingStudent.setAttendingClassRelatedStatus(student.getAttendingClassRelatedStatus());
            existingStudent.setPassedHighestJLPTLevel(student.getPassedHighestJLPTLevel());
            existingStudent.setJapanTravelExperience(student.getJapanTravelExperience());
            existingStudent.setCoeApplicationExperience(student.getCoeApplicationExperience());
            existingStudent.setHostelPreference(student.getHostelPreference());
            existingStudent.setIsAlcoholDrink(student.getIsAlcoholDrink());
            existingStudent.setIsSmoking(student.getIsSmoking());
            existingStudent.setHaveTatto(student.getHaveTatto());
            existingStudent.setEnrolledDate(student.getEnrolledDate());
            existingStudent.setSchedulePaymentTutionDate(student.getSchedulePaymentTutionDate());
            existingStudent.setActualTutionPaymentDate(student.getActualTutionPaymentDate());
            existingStudent.setMemoNotes(student.getMemoNotes());
            existingStudent.setUpdatedAt(LocalDate.now());

            // 3. Save the existing entity (which still has the Basic Info attached)
            studentService.save(existingStudent);

            redirectAttributes.addFlashAttribute("success", "ステータス情報が正常に更新されました。");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました: " + e.getMessage());
        }

        return buildUpdateRedirectUrl(id, "status", nameSearch, filterStatus);
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
        return studentExportService.getAllStudentsFull(nameSearch, status);
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
}