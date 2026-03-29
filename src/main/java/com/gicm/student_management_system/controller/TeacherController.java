package com.gicm.student_management_system.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.gicm.student_management_system.dto.CourseDTO;
import com.gicm.student_management_system.dto.TeacherDTO;
import com.gicm.student_management_system.service.CourseService;
import com.gicm.student_management_system.service.TeacherService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/teachers")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class TeacherController {

    private final TeacherService teacherService;
    private final CourseService courseService;

    @GetMapping
    public String listTeachers(@RequestParam(value = "search", required = false) String search,
                               Model model) {
        List<TeacherDTO> teachers = teacherService.searchTeachers(search);
        model.addAttribute("teachers", teachers);
        model.addAttribute("search", search);
        return "teachers/list";
    }

    @GetMapping("/{id}")
    public String getTeacherDetails(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        return teacherService.getTeacherById(id)
                .map(teacher -> {
                    model.addAttribute("teacher", teacher);
                    List<CourseDTO> courses = courseService.getCoursesByTeacher(id);
                    model.addAttribute("courses", courses);
                    return "teachers/details";
                })
                .orElseGet(() -> {
                    redirectAttributes.addFlashAttribute("error", "教師が見つかりません");
                    return "redirect:/teachers";
                });
    }

    @GetMapping("/add")
    public String showAddForm(Model model) {
        model.addAttribute("teacher", new TeacherDTO());
        return "teachers/form";
    }

    @PostMapping("/add")
    public String addTeacher(@Valid @ModelAttribute("teacher") TeacherDTO teacherDTO,
                            BindingResult bindingResult,
                            RedirectAttributes redirectAttributes,
                            Model model) {
        if (bindingResult.hasErrors()) {
            return "teachers/form";
        }

        try {
            if (teacherService.existsByEmail(teacherDTO.getEmail())) {
                bindingResult.rejectValue("email", "error.teacher", "このメールアドレスは既に登録されています");
                return "teachers/form";
            }

            teacherService.createTeacher(teacherDTO);
            redirectAttributes.addFlashAttribute("success", "教師が正常に追加されました");
            return "redirect:/teachers";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "追加に失敗しました: " + e.getMessage());
            return "redirect:/teachers/add";
        }
    }

    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        return teacherService.getTeacherById(id)
                .map(teacher -> {
                    model.addAttribute("teacher", teacher);
                    return "teachers/form";
                })
                .orElseGet(() -> {
                    redirectAttributes.addFlashAttribute("error", "教師が見つかりません");
                    return "redirect:/teachers";
                });
    }

    @PostMapping("/edit/{id}")
    public String updateTeacher(@PathVariable Long id,
                               @Valid @ModelAttribute("teacher") TeacherDTO teacherDTO,
                               BindingResult bindingResult,
                               RedirectAttributes redirectAttributes,
                               Model model) {
        if (bindingResult.hasErrors()) {
            return "teachers/form";
        }

        try {
            teacherService.updateTeacher(id, teacherDTO);
            redirectAttributes.addFlashAttribute("success", "教師情報が更新されました");
            return "redirect:/teachers/" + id;
        } catch (RuntimeException e) {
            if (e.getMessage().contains("メールアドレス")) {
                bindingResult.rejectValue("email", "error.teacher", e.getMessage());
                return "teachers/form";
            }
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/teachers/edit/" + id;
        }
    }

    @GetMapping("/delete/{id}")
    public String deleteTeacher(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            teacherService.deleteTeacher(id);
            redirectAttributes.addFlashAttribute("success", "教師を非アクティブ状態にしました");
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("warning", e.getMessage());
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "処理に失敗しました: " + e.getMessage());
        }
        return "redirect:/teachers";
    }

    // for manual activate/deactivate
    @GetMapping("/deactivate/{id}")
    public String deactivateTeacher(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            teacherService.deactivateTeacher(id);
            redirectAttributes.addFlashAttribute("success", "教師を非アクティブ状態にしました");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "処理に失敗しました: " + e.getMessage());
        }
        return "redirect:/teachers";
    }

    @GetMapping("/activate/{id}")
    public String activateTeacher(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            teacherService.activateTeacher(id);
            redirectAttributes.addFlashAttribute("success", "教師をアクティブ状態にしました");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "処理に失敗しました: " + e.getMessage());
        }
        return "redirect:/teachers";
    }
}