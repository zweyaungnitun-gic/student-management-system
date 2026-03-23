package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.dto.TestDTO;
import com.gicm.student_management_system.dto.TestResultDTO;
import com.gicm.student_management_system.service.TestService;
import com.gicm.student_management_system.service.CourseService;
import com.gicm.student_management_system.service.TeacherService;
import com.gicm.student_management_system.service.TestResultService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/tests")
@RequiredArgsConstructor
public class TestController {

    private final TestService testService;
    private final CourseService courseService;
    private final TeacherService teacherService;
    private final TestResultService testResultService;  

    @GetMapping
    public String listTests(@RequestParam(value = "search", required = false) String search,
                            @RequestParam(value = "courseId", required = false) Long courseId,
                            Model model) {
        List<TestDTO> tests;
        if (courseId != null) {
            tests = testService.getTestsByCourse(courseId);
            model.addAttribute("selectedCourseId", courseId);
        } else if (search != null && !search.isEmpty()) {
            tests = testService.searchTests(search);
        } else {
            tests = testService.getAllTests();
        }

        model.addAttribute("tests", tests);
        model.addAttribute("search", search);
        model.addAttribute("courses", courseService.getAllCourses());
        return "tests/list";
    }

    @GetMapping("/{id}")
    public String getTestDetails(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        return testService.getTestById(id)
                .map(test -> {
                    model.addAttribute("test", test);
                    // Fetch statistics and results for this test
                    Map<String, Object> statistics = testResultService.getTestStatistics(id);
                    List<TestResultDTO> results = testResultService.getResultsByTest(id);
                    model.addAttribute("statistics", statistics);
                    model.addAttribute("results", results);
                    return "tests/details";
                })
                .orElseGet(() -> {
                    redirectAttributes.addFlashAttribute("error", "テストが見つかりません");
                    return "redirect:/tests";
                });
    }

    @GetMapping("/add")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public String showAddForm(Model model) {
        model.addAttribute("test", new TestDTO());
        model.addAttribute("courses", courseService.getAllCourses());
        model.addAttribute("teachers", teacherService.getAllTeachers());
        return "tests/form";
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public String addTest(@Valid @ModelAttribute("test") TestDTO testDTO,
                          BindingResult bindingResult,
                          @RequestParam(required = false) Long teacherId,
                          RedirectAttributes redirectAttributes,
                          Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("courses", courseService.getAllCourses());
            model.addAttribute("teachers", teacherService.getAllTeachers());
            return "tests/form";
        }

        try {
            testDTO.setCreatedById(teacherId);
            testService.createTest(testDTO);
            redirectAttributes.addFlashAttribute("success", "テストが正常に追加されました");
            return "redirect:/tests";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "追加に失敗しました: " + e.getMessage());
            return "redirect:/tests/add";
        }
    }

    @GetMapping("/edit/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public String showEditForm(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        return testService.getTestById(id)
                .map(test -> {
                    model.addAttribute("test", test);
                    model.addAttribute("courses", courseService.getAllCourses());
                    model.addAttribute("teachers", teacherService.getAllTeachers());
                    return "tests/form";
                })
                .orElseGet(() -> {
                    redirectAttributes.addFlashAttribute("error", "テストが見つかりません");
                    return "redirect:/tests";
                });
    }

    @PostMapping("/edit/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public String updateTest(@PathVariable Long id,
                             @Valid @ModelAttribute("test") TestDTO testDTO,
                             BindingResult bindingResult,
                             @RequestParam(required = false) Long teacherId,
                             RedirectAttributes redirectAttributes,
                             Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("courses", courseService.getAllCourses());
            model.addAttribute("teachers", teacherService.getAllTeachers());
            return "tests/form";
        }

        try {
            testDTO.setCreatedById(teacherId);
            testService.updateTest(id, testDTO);
            redirectAttributes.addFlashAttribute("success", "テスト情報が更新されました");
            return "redirect:/tests/" + id;
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/tests/edit/" + id;
        }
    }

    @GetMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteTest(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            testService.deleteTest(id);
            redirectAttributes.addFlashAttribute("success", "テストが削除されました");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "削除に失敗しました: " + e.getMessage());
        }
        return "redirect:/tests";
    }

    @GetMapping("/course/{courseId}")
    public String getTestsByCourse(@PathVariable Long courseId, Model model) {
        model.addAttribute("tests", testService.getTestsByCourse(courseId));
        model.addAttribute("courseId", courseId);
        return "tests/list";
    }
}