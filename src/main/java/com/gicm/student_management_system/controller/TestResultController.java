package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.dto.TestResultDTO;
import com.gicm.student_management_system.service.TestResultService;
import com.gicm.student_management_system.service.TestService;
import com.gicm.student_management_system.service.EnrollmentService;
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
import java.util.Map;

@Controller
@RequestMapping("/results")
@RequiredArgsConstructor
public class TestResultController {

    private final TestResultService testResultService;
    private final TestService testService;
    private final EnrollmentService enrollmentService;
    private final TeacherService teacherService;

    @GetMapping("/test/{testId}")
    public String getResultsByTest(@PathVariable Long testId,
                                   @RequestParam(value = "studentName", required = false) String studentName,
                                   Model model) {
        List<TestResultDTO> results = testResultService.getResultsByTest(testId);
        
        // Filter by student name if provided
        if (studentName != null && !studentName.isEmpty()) {
            String searchLower = studentName.toLowerCase();
            results = results.stream()
                    .filter(r -> r.getStudentName() != null && 
                            r.getStudentName().toLowerCase().contains(searchLower))
                    .toList();
        }

        Map<String, Object> statistics = testResultService.getTestStatistics(testId);
        
        model.addAttribute("results", results);
        model.addAttribute("statistics", statistics);
        model.addAttribute("test", testService.getTestById(testId).orElse(null));
        model.addAttribute("studentName", studentName);
        
        return "results/list";
    }

    @GetMapping("/add/{testId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public String showAddResultForm(@PathVariable Long testId, Model model) {
        TestResultDTO resultDTO = new TestResultDTO();
        resultDTO.setTestId(testId);
        
        model.addAttribute("result", resultDTO);
        model.addAttribute("test", testService.getTestById(testId).orElse(null));
        model.addAttribute("enrollments", enrollmentService.getActiveEnrollmentsByCourse(
                testService.getTestById(testId).get().getCourseId()));
        model.addAttribute("teachers", teacherService.getAllTeachers());
        
        return "results/form";
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public String addResult(@Valid @ModelAttribute("result") TestResultDTO resultDTO,
                            BindingResult bindingResult,
                            @RequestParam Long teacherId,
                            RedirectAttributes redirectAttributes,
                            Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("test", testService.getTestById(resultDTO.getTestId()).orElse(null));
            model.addAttribute("enrollments", enrollmentService.getActiveEnrollmentsByCourse(
                    testService.getTestById(resultDTO.getTestId()).get().getCourseId()));
            model.addAttribute("teachers", teacherService.getAllTeachers());
            return "results/form";
        }

        try {
            resultDTO.setGradedById(teacherId);
            testResultService.addOrUpdateResult(resultDTO);
            redirectAttributes.addFlashAttribute("success", "結果が正常に追加されました");
            return "redirect:/results/test/" + resultDTO.getTestId();
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "追加に失敗しました: " + e.getMessage());
            return "redirect:/results/add/" + resultDTO.getTestId();
        }
    }

    @GetMapping("/edit/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public String showEditResultForm(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        return testResultService.getResultById(id)
                .map(result -> {
                    model.addAttribute("result", result);
                    model.addAttribute("test", testService.getTestById(result.getTestId()).orElse(null));
                    model.addAttribute("enrollments", enrollmentService.getActiveEnrollmentsByCourse(
                            testService.getTestById(result.getTestId()).get().getCourseId()));
                    model.addAttribute("teachers", teacherService.getAllTeachers());
                    return "results/form";
                })
                .orElseGet(() -> {
                    redirectAttributes.addFlashAttribute("error", "結果が見つかりません");
                    return "redirect:/tests";
                });
    }

    @PostMapping("/edit/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public String updateResult(@PathVariable Long id,
                               @Valid @ModelAttribute("result") TestResultDTO resultDTO,
                               BindingResult bindingResult,
                               @RequestParam Long teacherId,
                               RedirectAttributes redirectAttributes,
                               Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("test", testService.getTestById(resultDTO.getTestId()).orElse(null));
            model.addAttribute("enrollments", enrollmentService.getActiveEnrollmentsByCourse(
                    testService.getTestById(resultDTO.getTestId()).get().getCourseId()));
            model.addAttribute("teachers", teacherService.getAllTeachers());
            return "results/form";
        }

        try {
            resultDTO.setTestResultId(id);
            resultDTO.setGradedById(teacherId);
            testResultService.addOrUpdateResult(resultDTO);
            redirectAttributes.addFlashAttribute("success", "結果が正常に更新されました");
            return "redirect:/results/test/" + resultDTO.getTestId();
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました: " + e.getMessage());
            return "redirect:/results/edit/" + id;
        }
    }

    @GetMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteResult(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            TestResultDTO result = testResultService.getResultById(id).orElse(null);
            if (result != null) {
                Long testId = result.getTestId();
                testResultService.deleteResult(id);
                redirectAttributes.addFlashAttribute("success", "結果が削除されました");
                return "redirect:/results/test/" + testId;
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "削除に失敗しました: " + e.getMessage());
        }
        return "redirect:/tests";
    }
}