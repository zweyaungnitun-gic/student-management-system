package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.dto.EnrollmentDTO;
import com.gicm.student_management_system.service.CourseService;
import com.gicm.student_management_system.service.EnrollmentService;
import com.gicm.student_management_system.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/enrollments")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final StudentService studentService;
    private final CourseService courseService;

    @GetMapping
    public String listEnrollments(Model model) {
        List<EnrollmentDTO> enrollments = enrollmentService.getAllEnrollments();
        model.addAttribute("enrollments", enrollments);
        return "enrollments/list";
    }

    @GetMapping("/new")
    public String showEnrollmentForm(@RequestParam(value = "studentId", required = false) Long studentId,
                                   @RequestParam(value = "courseId", required = false) Long courseId,
                                   Model model) {
        EnrollmentDTO enrollmentDTO = new EnrollmentDTO();
        if (studentId != null) {
            enrollmentDTO.setStudentId(studentId);
        }
        if (courseId != null) {
            enrollmentDTO.setCourseId(courseId);
        }
        
        enrollmentDTO.setStatus("enrolled"); // Default to enrolled

        model.addAttribute("enrollment", enrollmentDTO);
        model.addAttribute("students", studentService.getAllStudentsForCurrentUser());
        model.addAttribute("courses", courseService.getActiveCourses());
        return "enrollments/new";
    }

    @PostMapping("/new")
    public String processEnrollment(@ModelAttribute("enrollment") EnrollmentDTO enrollmentDTO,
                                  RedirectAttributes redirectAttributes) {
        try {
            // Check if student is already enrolled in this course
            if (enrollmentService.getActiveEnrollmentByStudentAndCourse(enrollmentDTO.getStudentId(), enrollmentDTO.getCourseId()).isPresent()) {
                redirectAttributes.addFlashAttribute("error", "この生徒は既にこのコースに登録されています。");
                return "redirect:/enrollments/new?studentId=" + enrollmentDTO.getStudentId() + "&courseId=" + enrollmentDTO.getCourseId();
            }

            enrollmentService.createEnrollment(enrollmentDTO);
            redirectAttributes.addFlashAttribute("success", "受講登録が完了しました。");
            return "redirect:/enrollments";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "登録に失敗しました: " + e.getMessage());
            return "redirect:/enrollments/new";
        }
    }

    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        return enrollmentService.getEnrollmentById(id)
                .map(enrollment -> {
                    model.addAttribute("enrollment", enrollment);
                    model.addAttribute("students", studentService.getAllStudentsForCurrentUser());
                    model.addAttribute("courses", courseService.getActiveCourses());
                    return "enrollments/new"; // Reusing new.html for edit
                })
                .orElseGet(() -> {
                    redirectAttributes.addFlashAttribute("error", "受講登録が見つかりません。");
                    return "redirect:/enrollments";
                });
    }

    @PostMapping("/update/{id}")
    public String updateEnrollment(@PathVariable Long id, @ModelAttribute("enrollment") EnrollmentDTO enrollmentDTO,
                                 RedirectAttributes redirectAttributes) {
        try {
            enrollmentService.updateEnrollment(id, enrollmentDTO);
            redirectAttributes.addFlashAttribute("success", "受講登録が更新されました。");
            return "redirect:/enrollments";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました: " + e.getMessage());
            return "redirect:/enrollments/edit/" + id;
        }
    }

    @PostMapping("/delete/{id}")
    public String deleteEnrollment(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            enrollmentService.deleteEnrollment(id);
            redirectAttributes.addFlashAttribute("success", "受講登録が削除されました。");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "削除に失敗しました: " + e.getMessage());
        }
        return "redirect:/enrollments";
    }
}
