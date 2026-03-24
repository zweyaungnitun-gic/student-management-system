package com.gicm.student_management_system.controller;

import java.util.List;
import java.util.Map;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.gicm.student_management_system.dto.GradeCalculationDTO;
import com.gicm.student_management_system.dto.ReportCardDTO;
import com.gicm.student_management_system.dto.TestResultDTO;
import com.gicm.student_management_system.service.TestResultService;
import com.gicm.student_management_system.service.TestService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportsController {

        private final TestResultService testResultService;
        private final TestService testService;
        private final MessageSource messageSource;

        // @GetMapping("/dashboard")
        // public String dashboard() {
        // return "reports/dashboard";
        // }

        @GetMapping("/student/{studentId}")
        public String studentGradeSummary(@PathVariable Long studentId,
                        @RequestParam(defaultValue = "2024-2025") String academicYear,
                        @RequestParam(defaultValue = "Semester 1") String semester,
                        @RequestParam(defaultValue = "1") int page,
                        @RequestParam(defaultValue = "10") int size,
                        Model model) {
                GradeCalculationDTO gradeSummary = testResultService.getStudentGradeSummary(studentId, academicYear,
                                semester);

                // Get test results and apply pagination
                List<TestResultDTO> allResults = gradeSummary.getTestResults();
                if (allResults == null) {
                        allResults = new ArrayList<>();
                }

                int totalResults = allResults.size();
                int totalPages = (int) Math.ceil((double) totalResults / size);
                int start = (page - 1) * size;
                int end = Math.min(start + size, totalResults);

                List<TestResultDTO> paginatedResults = start < totalResults ? allResults.subList(start, end)
                                : new ArrayList<>();

                // Update gradeSummary with paginated results
                gradeSummary.setTestResults(paginatedResults);

                model.addAttribute("gradeSummary", gradeSummary);
                model.addAttribute("academicYear", academicYear);
                model.addAttribute("semester", semester);
                model.addAttribute("currentPage", page);
                model.addAttribute("pageSize", size);
                model.addAttribute("totalPages", totalPages);
                model.addAttribute("totalResults", totalResults);
                model.addAttribute("pageTitle", "成績サマリー");
                model.addAttribute("currentPageNav", "reports");

                return "reports/grade-summary";
        }

        @GetMapping("/report-card/{studentId}")
        public String reportCard(@PathVariable Long studentId,
                        @RequestParam(defaultValue = "2024-2025") String academicYear,
                        @RequestParam(defaultValue = "Semester 1") String semester,
                        Model model) {
                ReportCardDTO reportCard = testResultService.generateStudentReportCard(studentId, academicYear,
                                semester);
                model.addAttribute("reportCard", reportCard);
                model.addAttribute("pageTitle",
                                messageSource.getMessage("report.report.card", null, LocaleContextHolder.getLocale()));
                return "reports/report-card";
        }

        @GetMapping("/rankings")
        @PreAuthorize("hasRole('ADMIN')")
        public String classRankings(@RequestParam(defaultValue = "N5") String className,
                        @RequestParam(defaultValue = "2024-2025") String academicYear,
                        @RequestParam(defaultValue = "Semester 1") String semester,
                        Model model) {
                Map<String, Object> rankings = testResultService.getClassRankings(className, academicYear, semester);
                model.addAttribute("rankings", rankings);
                model.addAttribute("pageTitle", "クラス順位");
                model.addAttribute("currentPage", "rankings");
                return "reports/class-rankings";
        }

        @GetMapping("/test/{testId}/statistics")
        public String testStatistics(@PathVariable Long testId, Model model) {
                Map<String, Object> statistics = testResultService.getTestStatistics(testId);
                List<TestResultDTO> results = testResultService.getResultsByTest(testId);

                model.addAttribute("statistics", statistics);
                model.addAttribute("results", results);
                model.addAttribute("test", testService.getTestById(testId).orElse(null));
                model.addAttribute("pageTitle", messageSource.getMessage("report.test.statistics", null,
                                LocaleContextHolder.getLocale()));

                return "reports/test-statistics";
        }

        @GetMapping("/report-card/{studentId}/export")
        @ResponseBody
        public String exportReportCard(@PathVariable Long studentId,
                        @RequestParam String academicYear,
                        @RequestParam String semester) {
                return "PDF generation would happen here";
        }
}