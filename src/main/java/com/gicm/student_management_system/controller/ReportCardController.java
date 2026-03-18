package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.dto.GradeCalculationDTO;
import com.gicm.student_management_system.dto.ReportCardDTO;
import com.gicm.student_management_system.dto.TestResultDTO;
import com.gicm.student_management_system.service.TestResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportCardController {

    private final TestResultService testResultService;

    @GetMapping("/student/{studentId}")
    public String getStudentGrades(@PathVariable Long studentId,
                                   @RequestParam(required = false) String academicYear,
                                   @RequestParam(required = false) String semester,
                                   Model model) {
        
        // Use current academic year/semester if not provided
        if (academicYear == null) academicYear = "2024-2025";
        if (semester == null) semester = "Semester 1";

        GradeCalculationDTO gradeSummary = testResultService.getStudentGradeSummary(studentId, academicYear, semester);
        
        model.addAttribute("gradeSummary", gradeSummary);
        model.addAttribute("academicYear", academicYear);
        model.addAttribute("semester", semester);
        model.addAttribute("pageTitle", "成績サマリー");
        
        return "reports/grade-summary";
    }


    // Generate and view report card
    @GetMapping("/report-card/{studentId}")
    public String viewReportCard(@PathVariable Long studentId,
                                 @RequestParam(required = false) String academicYear,
                                 @RequestParam(required = false) String semester,
                                 Model model,
                                 RedirectAttributes redirectAttributes) {
        try {
            if (academicYear == null) academicYear = "2024-2025";
            if (semester == null) semester = "Semester 1";

            ReportCardDTO reportCard = testResultService.generateStudentReportCard(studentId, academicYear, semester);
            
            model.addAttribute("reportCard", reportCard);
            model.addAttribute("pageTitle", "成績通知表");
            
            return "reports/report-card";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "成績表の生成に失敗しました: " + e.getMessage());
            return "redirect:/students/detail/" + studentId;
        }
    }


    // Class rankings page
    @GetMapping("/rankings")
    @PreAuthorize("hasRole('ADMIN')")
    public String viewClassRankings(@RequestParam String className,
                                    @RequestParam(required = false) String academicYear,
                                    @RequestParam(required = false) String semester,
                                    Model model) {
        if (academicYear == null) academicYear = "2024-2025";
        if (semester == null) semester = "Semester 1";

        Map<String, Object> rankings = testResultService.getClassRankings(className, academicYear, semester);
        
        model.addAttribute("rankings", rankings);
        model.addAttribute("className", className);
        model.addAttribute("academicYear", academicYear);
        model.addAttribute("semester", semester);
        model.addAttribute("pageTitle", "クラス順位");
        
        return "reports/class-rankings";
    }

    // Test statistics page
    @GetMapping("/test/{testId}/statistics")
    public String viewTestStatistics(@PathVariable Long testId, Model model) {
        Map<String, Object> statistics = testResultService.getTestStatistics(testId);
        List<TestResultDTO> results = testResultService.getResultsByTest(testId);
        
        model.addAttribute("statistics", statistics);
        model.addAttribute("results", results);
        model.addAttribute("pageTitle", "テスト統計");
        
        return "reports/test-statistics";
    }

    // Export report card as PDF (would need PDF generation library)
    @GetMapping("/report-card/{studentId}/export")
    @ResponseBody
    public String exportReportCard(@PathVariable Long studentId,
                                   @RequestParam String academicYear,
                                   @RequestParam String semester) {
        return "PDF generation would happen here";
    }
}