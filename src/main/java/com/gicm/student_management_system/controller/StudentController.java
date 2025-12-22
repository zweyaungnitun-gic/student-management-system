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
import com.gicm.student_management_system.validation.BasicInfoGroup;
import com.gicm.student_management_system.validation.StatusGroup;

import jakarta.validation.Valid;
import com.gicm.student_management_system.service.InterviewNotesService;

import com.gicm.student_management_system.service.StudentExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
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

    private static final Logger logger = LoggerFactory.getLogger(StudentController.class);

    // ---- UI METHODS ----
    @GetMapping
    public String getStudents(@RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            @RequestParam(value = "status", defaultValue = "") String status,
            Model model) {

        // Log access for security monitoring
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.info("Student list accessed by user: {}, roles: {}",
                auth.getName(), auth.getAuthorities());

        List<String> statuses = new ArrayList<>();
        if (!status.isBlank()) {
            statuses = Arrays.asList(status.split(","));
        }

        List<StudentDTO> students = studentService.getStudentsByStatuses(nameSearch, statuses);

        // Sort by STU ID safely
        students.sort(Comparator.comparing(
                StudentDTO::getStudentId,
                Comparator.nullsLast(String::compareTo)));

        model.addAttribute("students", students);
        model.addAttribute("nameSearch", nameSearch);
        model.addAttribute("statusFilter", status);

        return "students/student-list"; // no .html
    }

    @GetMapping("/delete/{id}")
    public String deleteStudent(@PathVariable Long id) {
        // Add authorization check
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Student student = studentService.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found: " + id));

        if (!hasPermissionToModify(auth, student)) {
            logger.warn("Unauthorized delete attempt by user: {} for student ID: {}",
                    auth.getName(), id);
            throw new AccessDeniedException("You do not have permission to delete this student");
        }

        logger.info("Student {} deleted by user {}", id, auth.getName());
        studentService.deleteStudent(id);
        return "redirect:/students";
    }

    // METHOD FOR DETAILS
    @GetMapping("/detail/{id}")
    public String showStudentDetails(@PathVariable Long id,
            @RequestParam(required = false, defaultValue = "personal") String tab,
            @RequestParam(required = false) String subTab,
            Model model) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Student student = studentService.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found: " + id));

        // Check if user has permission to view this student
        if (!hasPermissionToView(auth, student)) {
            logger.warn("Unauthorized view attempt by user: {} for student ID: {}",
                    auth.getName(), id);
            throw new AccessDeniedException("You do not have permission to view this student");
        }

        logger.info("Student details viewed by user: {} for student ID: {}",
                auth.getName(), id);

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
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        Student student = studentService.findById(id)
                .orElseThrow(() -> new RuntimeException("生徒が見つかりません: ID " + id));

        // Check if user has permission to edit this student
        if (!hasPermissionToModify(auth, student)) {
            logger.warn("Unauthorized edit attempt by user: {} for student ID: {}",
                    auth.getName(), id);
            throw new AccessDeniedException("You do not have permission to edit this student");
        }

        logger.info("Student edit form accessed by user: {} for student ID: {}",
                auth.getName(), id);

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
            @Validated(BasicInfoGroup.class) @ModelAttribute("student") Student student,
            BindingResult bindingResult,
            RedirectAttributes redirectAttributes,
            Model model) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // First check permission before any processing
        Student existingStudent = studentService.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found: " + id));

        if (!hasPermissionToModify(auth, existingStudent)) {
            logger.warn("Unauthorized update attempt by user: {} for student ID: {}",
                    auth.getName(), id);
            throw new AccessDeniedException("You do not have permission to update this student");
        }

        if (bindingResult.hasErrors()) {
            // Load all necessary data for the form
            N5ClassDTO n5ClassDTO = n5ClassService.getOrCreateN5ClassDTO(id);
            model.addAttribute("n5Class", n5ClassDTO);

            N4ClassDTO n4ClassDTO = n4ClassService.getOrCreateN4ClassDTO(id);
            model.addAttribute("n4Class", n4ClassDTO);

            InterviewNotesDTO interviewNotesDTO = interviewNotesService.getOrCreateInterviewNotesDTO(id);
            model.addAttribute("interviewNotes", interviewNotesDTO);

            model.addAttribute("student", student);
            model.addAttribute("isNew", false);
            return "students/student-update.html?tab=basic";
        }

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

        logger.info("Student basic info updated by user: {} for student ID: {}",
                auth.getName(), id);
        redirectAttributes.addFlashAttribute("success", "基本情報が正常に更新されました。");

        return "redirect:/students/student-update/" + id + "?tab=basic";
    }

    @PostMapping("/update-status/{id}")
    public String updateStatusInfo(@PathVariable Long id,
            @Validated(StatusGroup.class) @ModelAttribute Student student,
            BindingResult bindingResult,
            RedirectAttributes redirectAttributes,
            Model model) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Check permission first
        Student existingStudent = studentService.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found: " + id));

        if (!hasPermissionToModify(auth, existingStudent)) {
            logger.warn("Unauthorized status update attempt by user: {} for student ID: {}",
                    auth.getName(), id);
            throw new AccessDeniedException("You do not have permission to update this student");
        }

        if (bindingResult.hasErrors()) {
            // Load all necessary data for the form
            N5ClassDTO n5ClassDTO = n5ClassService.getOrCreateN5ClassDTO(id);
            model.addAttribute("n5Class", n5ClassDTO);

            N4ClassDTO n4ClassDTO = n4ClassService.getOrCreateN4ClassDTO(id);
            model.addAttribute("n4Class", n4ClassDTO);

            InterviewNotesDTO interviewNotesDTO = interviewNotesService.getOrCreateInterviewNotesDTO(id);
            model.addAttribute("interviewNotes", interviewNotesDTO);

            model.addAttribute("student", student);
            model.addAttribute("isNew", false);
            return "students/student-update.html?tab=status";
        }

        try {
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

            logger.info("Student status info updated by user: {} for student ID: {}",
                    auth.getName(), id);
            redirectAttributes.addFlashAttribute("success", "ステータス情報が正常に更新されました。");
        } catch (Exception e) {
            logger.error("Error updating student status for ID {} by user {}: {}",
                    id, auth.getName(), e.getMessage(), e);
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました: " + e.getMessage());
        }

        return "redirect:/students/student-update/" + id + "?tab=status";
    }

    @PostMapping("/update-n5/{id}")
    public String updateN5ClassInfo(@PathVariable Long id,
            @ModelAttribute("n5Class") N5ClassDTO n5ClassDTO,
            RedirectAttributes redirectAttributes) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Check permission
        Student student = studentService.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found: " + id));

        if (!hasPermissionToModify(auth, student)) {
            logger.warn("Unauthorized N5 update attempt by user: {} for student ID: {}",
                    auth.getName(), id);
            throw new AccessDeniedException("You do not have permission to update this student's N5 info");
        }

        try {
            n5ClassService.saveN5ClassDTO(id, n5ClassDTO);

            logger.info("Student N5 info updated by user: {} for student ID: {}",
                    auth.getName(), id);
            redirectAttributes.addFlashAttribute("success", "N5クラス情報が正常に更新されました。");
        } catch (Exception e) {
            logger.error("Error updating N5 info for student ID {} by user {}: {}",
                    id, auth.getName(), e.getMessage(), e);
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました: " + e.getMessage());
        }

        return "redirect:/students/student-update/" + id + "?tab=n5";
    }

    @PostMapping("/update-n4/{id}")
    public String updateN4ClassInfo(@PathVariable Long id,
            @ModelAttribute("n4Class") N4ClassDTO n4ClassDTO,
            RedirectAttributes redirectAttributes) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Check permission
        Student student = studentService.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found: " + id));

        if (!hasPermissionToModify(auth, student)) {
            logger.warn("Unauthorized N4 update attempt by user: {} for student ID: {}",
                    auth.getName(), id);
            throw new AccessDeniedException("You do not have permission to update this student's N4 info");
        }

        try {
            n4ClassService.saveN4ClassDTO(id, n4ClassDTO);

            logger.info("Student N4 info updated by user: {} for student ID: {}",
                    auth.getName(), id);
            redirectAttributes.addFlashAttribute("success", "N4クラス情報が正常に更新されました。");
        } catch (Exception e) {
            logger.error("Error updating N4 info for student ID {} by user {}: {}",
                    id, auth.getName(), e.getMessage(), e);
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました: " + e.getMessage());
        }

        return "redirect:/students/student-update/" + id + "?tab=n4";
    }

    @PostMapping("/update-interview/{id}")
    public String updateInterviewNotes(@PathVariable Long id,
            @ModelAttribute("interviewNotes") InterviewNotesDTO interviewNotesDTO,
            RedirectAttributes redirectAttributes) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Check permission
        Student student = studentService.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found: " + id));

        if (!hasPermissionToModify(auth, student)) {
            logger.warn("Unauthorized interview update attempt by user: {} for student ID: {}",
                    auth.getName(), id);
            throw new AccessDeniedException("You do not have permission to update this student's interview info");
        }

        try {
            interviewNotesService.saveInterviewNotesDTO(id, interviewNotesDTO);

            logger.info("Student interview info updated by user: {} for student ID: {}",
                    auth.getName(), id);
            redirectAttributes.addFlashAttribute("success", "面談情報が正常に更新されました。");
        } catch (Exception e) {
            logger.error("Error updating interview info for student ID {} by user {}: {}",
                    id, auth.getName(), e.getMessage(), e);
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました: " + e.getMessage());
        }

        return "redirect:/students/student-update/" + id + "?tab=interview";
    }

    @GetMapping("/export")
    @ResponseBody
    public List<StudentFullExportDTO> getStudentsExport(
            @RequestParam(value = "ids", required = false) List<Long> ids,
            @RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
            @RequestParam(value = "status", defaultValue = "") String status) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.info("Student export accessed by user: {}", auth.getName());

        if (ids != null && !ids.isEmpty()) {
            // Filter IDs based on user permissions
            List<Long> authorizedIds = ids.stream()
                    .filter(id -> {
                        try {
                            Student student = studentService.findById(id)
                                    .orElse(null);
                            return student != null && hasPermissionToView(auth, student);
                        } catch (Exception e) {
                            return false;
                        }
                    })
                    .collect(java.util.stream.Collectors.toList());

            return studentExportService.getStudentsByIds(authorizedIds);
        }

        return studentExportService.getAllStudentsFull(nameSearch, status);
    }

    // Helper methods for permission checking
    private boolean hasPermissionToView(Authentication auth, Student student) {
        // Implement your permission logic here
        // Example: Check if user has ADMIN role or is assigned to this student

        // For now, allow all authenticated users to view
        // You should implement proper role-based or ownership-based checks
        return auth != null && auth.isAuthenticated();
    }

    private boolean hasPermissionToModify(Authentication auth, Student student) {
        // Implement more restrictive checks for modification
        // Example: Only ADMINs and specific teachers can modify

        // Check if user has ADMIN role
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            return true;
        }

        // Check if user is a teacher assigned to this student
        // You need to implement this based on your user-student relationships

        // For now, allow all authenticated users (temporary)
        // WARNING: This is not secure for production!
        return auth != null && auth.isAuthenticated();
    }
}