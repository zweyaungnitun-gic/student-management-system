package com.gicm.student_management_system.controller;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.context.MessageSource;
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

import com.gicm.student_management_system.dto.CourseEnrollmentResultsDTO;
import com.gicm.student_management_system.dto.EnrollmentDTO;
import com.gicm.student_management_system.dto.InterviewNotesDTO;
import com.gicm.student_management_system.dto.StudentDTO;
import com.gicm.student_management_system.dto.StudentFullExportDTO;
import com.gicm.student_management_system.dto.StudentRegistrationDTO;
import com.gicm.student_management_system.dto.TestResultDTO;
import com.gicm.student_management_system.entity.RegistrationStatus;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.entity.StudentRegistration;
import com.gicm.student_management_system.repository.AdditionalStudentInfoRepository;
import com.gicm.student_management_system.service.EnrollmentService;
import com.gicm.student_management_system.service.InterviewNotesService;
import com.gicm.student_management_system.service.StudentExportService;
import com.gicm.student_management_system.service.StudentRegistrationService;
import com.gicm.student_management_system.service.StudentService;
import com.gicm.student_management_system.service.TestResultService;
import com.gicm.student_management_system.validation.BasicInfoGroup;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@RequestMapping("/students")
public class StudentController {

    private final StudentService studentService;
    private final StudentExportService studentExportService;
    private final InterviewNotesService interviewNotesService;
    private final StudentRegistrationService studentRegistrationService;
    private final EnrollmentService enrollmentService;
    private final TestResultService testResultService;
    private final MessageSource messageSource;
    private final AdditionalStudentInfoRepository additionalStudentInfoRepository;

    // ---- UI METHODS ----
    @GetMapping
    public String getStudents(@RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            @RequestParam(value = "status", defaultValue = "") String status,
            Model model) {

        List<StudentDTO> students;

        // Student no longer has a 'status' column; keep name search only.
        // Use tenant-filtered methods for multi-tenancy
        if (nameSearch.isBlank()) {
            students = studentService.getAllStudentsForCurrentUser();
        } else {
            students = studentService.getStudentsByFilterForCurrentUser(nameSearch);
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
            @RequestParam(required = false, defaultValue = "courses") String tab,
            @RequestParam(required = false) String subTab,
            @RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            // Rename this to filterStatus in the method signature
            @RequestParam(value = "status", defaultValue = "") String filterStatus,
            Model model) {

        studentService.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found: " + id));

        // Fetch Student DTO via Studentservice (template expects DTO fields)
        StudentDTO studentDTO = studentService.getStudentById(id);
        model.addAttribute("student", studentDTO);

        InterviewNotesDTO interviewNotes = interviewNotesService.getOrCreateInterviewNotesDTO(id);

        model.addAttribute("interviewNotes", interviewNotes);
        model.addAttribute("nameSearch", nameSearch);
        model.addAttribute("status", filterStatus);

        // model.addAttribute("student", student);
        // Courses + results view for any tab value for now (new layout)

        List<EnrollmentDTO> enrollments = enrollmentService.getEnrollmentsByStudent(id);
        // Group by (courseId + semester) so we don't mix different semesters
        java.util.Map<String, CourseEnrollmentResultsDTO> grouped = new java.util.LinkedHashMap<>();

        // Fetch results per enrollment and attach to each group
        for (EnrollmentDTO en : enrollments) {
            if (en == null) continue;

            String key = (en.getCourseId() != null ? en.getCourseId() : 0) + ":" + (en.getSemester() != null ? en.getSemester() : "");

            CourseEnrollmentResultsDTO group = grouped.get(key);
            if (group == null) {
                group = CourseEnrollmentResultsDTO.builder()
                        .enrollmentId(en.getEnrollmentId())
                        .courseId(en.getCourseId())
                        .courseCode(en.getCourseCode())
                        .courseName(en.getCourseName())
                        .semester(en.getSemester())
                        .enrollmentStatus(en.getStatusDisplay())
                        .results(new java.util.ArrayList<>())
                        .build();
                grouped.put(key, group);
            }

            List<TestResultDTO> results = testResultService.getResultsByEnrollment(en.getEnrollmentId());
            if (results != null && !results.isEmpty()) {
                // Sort newest first for better display
                results.sort((a, b) -> {
                    if (a == null || a.getSubmittedAt() == null) return 1;
                    if (b == null || b.getSubmittedAt() == null) return -1;
                    return b.getSubmittedAt().compareTo(a.getSubmittedAt());
                });
                group.getResults().addAll(results);
            }
        }

        // Final sort per group (in case multiple enrollments were merged into one group)
        List<CourseEnrollmentResultsDTO> studentCourseEnrollments = new java.util.ArrayList<>(grouped.values());
        for (CourseEnrollmentResultsDTO g : studentCourseEnrollments) {
            if (g.getResults() != null && !g.getResults().isEmpty()) {
                g.getResults().sort((a, b) -> {
                    if (a == null || a.getSubmittedAt() == null) return 1;
                    if (b == null || b.getSubmittedAt() == null) return -1;
                    return b.getSubmittedAt().compareTo(a.getSubmittedAt());
                });
            }
        }

        model.addAttribute("studentCourseEnrollments", studentCourseEnrollments);

        return "students/student-details-courses";
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
                messageSource.getMessage("student.create.success", new Object[]{created.getStudentId()}, java.util.Locale.getDefault()));

        return "redirect:/students";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/student-update/{id}")
    public String showUpdateForm(@PathVariable Long id,
            @RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            @RequestParam(value = "status", defaultValue = "") String status,
            Model model) {
        StudentDTO studentDTO = studentService.getStudentById(id);
        if (studentDTO == null) {
            throw new RuntimeException(messageSource.getMessage("student.not.found", null, java.util.Locale.getDefault()) + ": ID " + id);
        }

        InterviewNotesDTO interviewNotesDTO = interviewNotesService.getOrCreateInterviewNotesDTO(id);
        model.addAttribute("interviewNotes", interviewNotesDTO);

        model.addAttribute("student", studentDTO);
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
                bindingResult.rejectValue("nationalId", "error.duplicate", messageSource.getMessage("student.duplicate.national.id", null, java.util.Locale.getDefault()));
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

        redirectAttributes.addFlashAttribute("success", messageSource.getMessage("success.update", null, java.util.Locale.getDefault()));

        return buildUpdateRedirectUrl(id, "basic", nameSearch, status);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/update-status/{id}")
    public String updateStatus(
            @PathVariable Long id,
            @ModelAttribute("student") com.gicm.student_management_system.dto.StudentDTO formDto,
            RedirectAttributes redirectAttributes,
            @RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            @RequestParam(value = "filterStatus", defaultValue = "") String filterStatus) {

        com.gicm.student_management_system.entity.Student student = studentService.findById(id).orElse(null);
        if (student != null) {
            com.gicm.student_management_system.entity.AdditionalStudentInfo additionalInfo = additionalStudentInfoRepository
                    .findByCommonStudent_Id(id)
                    .orElse(new com.gicm.student_management_system.entity.AdditionalStudentInfo());
            
            additionalInfo.setCommonStudent(student);
            additionalInfo.setDesiredJobType(formDto.getDesiredJobType());
            additionalInfo.setOtherDesiredJobType(formDto.getOtherDesiredJobType());
            additionalInfo.setOtherReligion(formDto.getOtherReligion());
            additionalInfo.setCurrentJapanLevel(formDto.getCurrentJapanLevel());
            additionalInfo.setAttendingClassRelatedStatus(formDto.getAttendingClassRelatedStatus());
            additionalInfo.setPassedHighestJlptLevel(formDto.getPassedHighestJlptLevel());
            additionalInfo.setJapanTravelExperience(formDto.getJapanTravelExperience());
            additionalInfo.setCoeApplicationExperience(formDto.getCoeApplicationExperience());
            additionalInfo.setHostelPreference(formDto.getHostelPreference());
            additionalInfo.setIsAlcoholDrink(formDto.getIsAlcoholDrink());
            additionalInfo.setIsSmoking(formDto.getIsSmoking());
            additionalInfo.setHaveTatto(formDto.getHaveTatto());
            additionalInfo.setSchedulePaymentTutionDate(formDto.getSchedulePaymentTutionDate());
            additionalInfo.setActualTutionPaymentDate(formDto.getActualTutionPaymentDate());
            additionalInfo.setMemoNotes(formDto.getMemoNotes());
            
            // Also sink religion to the main Student entity
            student.setReligion(formDto.getReligion());
            if (formDto.getStatus() != null && !formDto.getStatus().isBlank()) {
                additionalInfo.setAttendingClassRelatedStatus(formDto.getStatus());
            }

            studentService.save(student);
            additionalStudentInfoRepository.save(additionalInfo);

            redirectAttributes.addFlashAttribute("success",
                    messageSource.getMessage("success.update", null, java.util.Locale.getDefault()));
        }
        
        return buildUpdateRedirectUrl(id, "status", nameSearch, filterStatus);
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
            redirectAttributes.addFlashAttribute("success", messageSource.getMessage("interview.update.success", null, java.util.Locale.getDefault()));
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", messageSource.getMessage("error.update", null, java.util.Locale.getDefault()));
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
            redirectAttributes.addFlashAttribute("error", messageSource.getMessage("registration.processed.error", null, java.util.Locale.getDefault()));
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
        redirectAttributes.addFlashAttribute("success", messageSource.getMessage("registration.update.success", null, java.util.Locale.getDefault()));
        return "redirect:/students/registrations/" + id;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/registrations/{id}/delete")
    public String registrationDelete(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        studentRegistrationService.deleteRegistration(id);
        redirectAttributes.addFlashAttribute("success", messageSource.getMessage("registration.delete.success", null, java.util.Locale.getDefault()));
        return "redirect:/students/registrations?registrationStatus=PENDING";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/registrations/{id}/accept")
    public String acceptRegistration(
            @PathVariable Long id,
            Principal principal,
            RedirectAttributes redirectAttributes) {
        studentRegistrationService.acceptRegistration(id, principal != null ? principal.getName() : "admin");
        redirectAttributes.addFlashAttribute("success", messageSource.getMessage("registration.approve.success", null, java.util.Locale.getDefault()));
        return "redirect:/students/registrations?registrationStatus=PENDING";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/registrations/{id}/reject")
    public String rejectRegistration(
            @PathVariable Long id,
            Principal principal,
            RedirectAttributes redirectAttributes) {
        studentRegistrationService.rejectRegistration(id, principal != null ? principal.getName() : "admin");
        redirectAttributes.addFlashAttribute("success", messageSource.getMessage("registration.reject.success", null, java.util.Locale.getDefault()));
        return "redirect:/students/registrations?registrationStatus=PENDING";
    }
}