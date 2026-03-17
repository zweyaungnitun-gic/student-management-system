package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.dto.CourseDTO;
import com.gicm.student_management_system.service.CourseService;
import com.gicm.student_management_system.service.TeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/courses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class CourseController {

    private final CourseService courseService;
    private final TeacherService teacherService;

    @GetMapping
    public String listCourses(@RequestParam(value = "search", required = false) String search,
                             @RequestParam(value = "active", required = false) Boolean activeOnly,
                             Model model) {
        List<CourseDTO> courses;
        if (activeOnly != null && activeOnly) {
            courses = courseService.getActiveCourses();
        } else {
            courses = courseService.searchCourses(search);
        }
        
        model.addAttribute("courses", courses);
        model.addAttribute("search", search);
        model.addAttribute("activeOnly", activeOnly);
        return "courses/list";
    }

    @GetMapping("/add")
    public String showAddForm(Model model) {
        model.addAttribute("course", new CourseDTO());
        model.addAttribute("teachers", teacherService.getAllTeachers());
        return "courses/form";
    }

    @PostMapping("/add")
    public String addCourse(@Valid @ModelAttribute("course") CourseDTO courseDTO,
                           BindingResult bindingResult,
                           RedirectAttributes redirectAttributes,
                           Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("teachers", teacherService.getAllTeachers());
            return "courses/form";
        }

        try {
            if (courseService.existsByCourseCode(courseDTO.getCourseCode())) {
                bindingResult.rejectValue("courseCode", "error.course", "このコースコードは既に使用されています");
                model.addAttribute("teachers", teacherService.getAllTeachers());
                return "courses/form";
            }

            courseService.createCourse(courseDTO);
            redirectAttributes.addFlashAttribute("success", "コースが正常に追加されました");
            return "redirect:/courses";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "追加に失敗しました: " + e.getMessage());
            return "redirect:/courses/add";
        }
    }

    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        return courseService.getCourseById(id)
                .map(course -> {
                    model.addAttribute("course", course);
                    model.addAttribute("teachers", teacherService.getAllTeachers());
                    return "courses/form";
                })
                .orElseGet(() -> {
                    redirectAttributes.addFlashAttribute("error", "コースが見つかりません");
                    return "redirect:/courses";
                });
    }

    @PostMapping("/edit/{id}")
    public String updateCourse(@PathVariable Long id,
                              @Valid @ModelAttribute("course") CourseDTO courseDTO,
                              BindingResult bindingResult,
                              RedirectAttributes redirectAttributes,
                              Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("teachers", teacherService.getAllTeachers());
            return "courses/form";
        }

        try {
            courseService.updateCourse(id, courseDTO);
            redirectAttributes.addFlashAttribute("success", "コース情報が更新されました");
            return "redirect:/courses";
        } catch (RuntimeException e) {
            if (e.getMessage().contains("コースコード")) {
                bindingResult.rejectValue("courseCode", "error.course", e.getMessage());
                model.addAttribute("teachers", teacherService.getAllTeachers());
                return "courses/form";
            }
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/courses/edit/" + id;
        }
    }

    @GetMapping("/delete/{id}")
    public String deleteCourse(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            courseService.deleteCourse(id);
            redirectAttributes.addFlashAttribute("success", "コースが削除されました");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "削除に失敗しました: " + e.getMessage());
        }
        return "redirect:/courses";
    }

    @PostMapping("/toggle/{id}")
    public String toggleCourseActive(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            courseService.toggleCourseActive(id);
            redirectAttributes.addFlashAttribute("success", "コースの状態が更新されました");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました: " + e.getMessage());
        }
        return "redirect:/courses";
    }

    @GetMapping("/teacher/{teacherId}")
    public String getCoursesByTeacher(@PathVariable Long teacherId, Model model) {
        return teacherService.getTeacherById(teacherId)
                .map(teacher -> {
                    List<CourseDTO> courses = courseService.getCoursesByTeacher(teacherId);
                    model.addAttribute("teacher", teacher);
                    model.addAttribute("courses", courses);
                    return "courses/teacher-courses";
                })
                .orElse("redirect:/teachers");
    }

    @GetMapping("/{id}")
    public String viewCourseDetails(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        return courseService.getCourseById(id)
                .map(course -> {
                    model.addAttribute("course", course);
                    model.addAttribute("enrollments", courseService.getEnrollmentsByCourseId(id));
                    model.addAttribute("tests", courseService.getTestsByCourseId(id));
                    model.addAttribute("averageScore", courseService.getAverageScoreByCourseId(id));
                    return "courses/details";
                })
                .orElseGet(() -> {
                    redirectAttributes.addFlashAttribute("error", "コースが見つかりません");
                    return "redirect:/courses";
                });
    }
}