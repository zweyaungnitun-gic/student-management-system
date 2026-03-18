package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.dto.TestResultDTO;
import com.gicm.student_management_system.service.TestResultService;
import com.gicm.student_management_system.service.TestService;
import com.gicm.student_management_system.service.CourseService;
import com.gicm.student_management_system.service.EnrollmentService;
import com.gicm.student_management_system.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.*;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/results")
@RequiredArgsConstructor
public class ResultsController {

    private final TestResultService testResultService;
    private final TestService testService;
    private final CourseService courseService;
    private final EnrollmentService enrollmentService;
    private final TeacherService teacherService;

    @GetMapping
    public String listResults(
            @RequestParam(required = false) Long testId,
            @RequestParam(required = false) String studentName,
            @RequestParam(required = false) Long courseId,
            @RequestParam(defaultValue = "1") int page,
            Model model) {
        
        List<TestResultDTO> results;
        
        if (testId != null) {
            results = testResultService.getResultsByTest(testId);
        } else if (courseId != null) {
            results = testResultService.getResultsByCourse(courseId);
        } else {
            results = testResultService.getAllResults();
        }
        
        // Filter by student name if provided
        if (studentName != null && !studentName.isEmpty()) {
            String searchLower = studentName.toLowerCase();
            results = results.stream()
                    .filter(r -> r.getStudentName() != null && 
                           r.getStudentName().toLowerCase().contains(searchLower))
                    .collect(Collectors.toList());
        }
        
        int pageSize = 20;
        int start = (page - 1) * pageSize;
        int end = Math.min(start + pageSize, results.size());
        
        List<TestResultDTO> paginatedResults = start < results.size() ? 
                results.subList(start, end) : new ArrayList<>();
        
        Map<String, Object> paramMap = new HashMap<>();
        paramMap.put("testId", testId);
        paramMap.put("studentName", studentName);
        paramMap.put("courseId", courseId);
        
        model.addAttribute("results", paginatedResults);
        model.addAttribute("allResultsCount", results.size());
        model.addAttribute("tests", testService.getAllTests());
        model.addAttribute("courses", courseService.getAllCourses());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", (int) Math.ceil((double) results.size() / pageSize));
        model.addAttribute("param", paramMap);
        
        return "results/list";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        List<TestResultDTO> allResults = testResultService.getAllResults();
        
        long passed = allResults.stream().filter(r -> "合格".equals(r.getResult())).count();
        long failed = allResults.stream().filter(r -> "不合格".equals(r.getResult())).count();
        double avgScore = allResults.stream()
                .mapToDouble(r -> r.getScoreObtained().doubleValue())
                .average()
                .orElse(0);
        
        model.addAttribute("totalTests", testService.getAllTests().size());
        model.addAttribute("totalPassed", passed);
        model.addAttribute("totalFailed", failed);
        model.addAttribute("averageScore", String.format("%.1f", avgScore));
        model.addAttribute("recentResults", allResults.stream().limit(10).collect(Collectors.toList()));
        
        return "results/dashboard";
    }

    @GetMapping("/add")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public String showAddForm(Model model) {
        model.addAttribute("result", new TestResultDTO());
        model.addAttribute("tests", testService.getAllTests());
        model.addAttribute("enrollments", enrollmentService.getAllEnrollments());
        model.addAttribute("teachers", teacherService.getAllTeachers());
        return "results/form";
    }

    @GetMapping("/edit/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public String showEditForm(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        return testResultService.getResultById(id)
                .map(result -> {
                    model.addAttribute("result", result);
                    model.addAttribute("tests", testService.getAllTests());
                    model.addAttribute("enrollments", enrollmentService.getAllEnrollments());
                    model.addAttribute("teachers", teacherService.getAllTeachers());
                    return "results/form";
                })
                .orElseGet(() -> {
                    redirectAttributes.addFlashAttribute("error", "結果が見つかりません");
                    return "redirect:/results";
                });
    }

    @PostMapping("/save")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public String saveResult(@ModelAttribute TestResultDTO resultDTO, RedirectAttributes redirectAttributes) {
        try {
            testResultService.addOrUpdateResult(resultDTO);
            redirectAttributes.addFlashAttribute("success", "結果が保存されました");
            return "redirect:/results";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "保存に失敗しました: " + e.getMessage());
            return "redirect:/results/add";
        }
    }

    @PostMapping("/update")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public String updateResult(@ModelAttribute TestResultDTO resultDTO, RedirectAttributes redirectAttributes) {
        try {
            testResultService.addOrUpdateResult(resultDTO);
            redirectAttributes.addFlashAttribute("success", "結果が更新されました");
            return "redirect:/results";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "更新に失敗しました: " + e.getMessage());
            return "redirect:/results/edit/" + resultDTO.getTestResultId();
        }
    }

    @GetMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteResult(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            testResultService.deleteResult(id);
            redirectAttributes.addFlashAttribute("success", "結果が削除されました");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "削除に失敗しました: " + e.getMessage());
        }
        return "redirect:/results";
    }

    @GetMapping("/test/{testId}")
    public String viewTestResults(@PathVariable Long testId, Model model) {
        List<TestResultDTO> results = testResultService.getResultsByTest(testId);
        Map<String, Object> statistics = testResultService.getTestStatistics(testId);
        
        model.addAttribute("results", results);
        model.addAttribute("statistics", statistics);
        model.addAttribute("test", testService.getTestById(testId).orElse(null));
        
        return "results/test-results";
    }
}