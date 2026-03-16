package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.dto.TeacherDTO;
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
@RequestMapping("/teachers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class TeacherController {

    private final TeacherService teacherService;

    @GetMapping
    public String listTeachers(@RequestParam(value = "search", required = false) String search,
                               Model model) {
        List<TeacherDTO> teachers = teacherService.searchTeachers(search);
        model.addAttribute("teachers", teachers);
        model.addAttribute("search", search);
        return "teachers/list";
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
            return "redirect:/teachers";
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
            redirectAttributes.addFlashAttribute("success", "教師が削除されました");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "削除に失敗しました: " + e.getMessage());
        }
        return "redirect:/teachers";
    }

    @GetMapping("/{id}/courses")
    public String viewTeacherCourses(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        return teacherService.getTeacherById(id)
                .map(teacher -> {
                    model.addAttribute("teacher", teacher);
                    // You'll need to add a method to get courses by teacher
                    return "teachers/courses";
                })
                .orElseGet(() -> {
                    redirectAttributes.addFlashAttribute("error", "教師が見つかりません");
                    return "redirect:/teachers";
                });
    }
}