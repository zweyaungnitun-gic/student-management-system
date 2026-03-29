package com.gicm.student_management_system.controller;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.gicm.student_management_system.dto.EnrollmentDTO;
import com.gicm.student_management_system.dto.StudentDTO;
import com.gicm.student_management_system.dto.TestDTO;
import com.gicm.student_management_system.dto.TestResultDTO;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.service.CourseService;
import com.gicm.student_management_system.service.EnrollmentService;
import com.gicm.student_management_system.service.StudentService;
import com.gicm.student_management_system.service.TeacherService;
import com.gicm.student_management_system.service.TestResultService;
import com.gicm.student_management_system.service.TestService;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/results")
@RequiredArgsConstructor
public class ResultsController {

    private final TestResultService testResultService;
    private final TestService testService;
    private final CourseService courseService;
    private final EnrollmentService enrollmentService;
    private final TeacherService teacherService;
    private final StudentService studentService;

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
        
        if (studentName != null && !studentName.isEmpty()) {
            String searchLower = studentName.toLowerCase();
            results = results.stream()
                    .filter(r -> r.getStudentName() != null && 
                           r.getStudentName().toLowerCase().contains(searchLower))
                    .collect(Collectors.toList());
        }
        
        int pageSize = 10;
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
                .filter(r -> r.getScoreObtained() != null)
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
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN') or hasRole('TEACHER')")
    public String showAddForm(Model model) {
        model.addAttribute("result", new TestResultDTO());
        model.addAttribute("tests", testService.getAllTests());
        
        List<EnrollmentDTO> enrollments = enrollmentService.getAllEnrollments();
        model.addAttribute("enrollments", enrollments);
        
        if (enrollments.isEmpty()) {
            model.addAttribute("warning", "受講登録がありません。先に生徒をコースに登録してください。");
        }
        
        model.addAttribute("teachers", teacherService.getAllTeachers());
        return "results/form";
    }

    @GetMapping("/edit/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN') or hasRole('TEACHER')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN') or hasRole('TEACHER')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN') or hasRole('TEACHER')")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
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

    @GetMapping("/student/{studentId}")
    public String viewStudentResults(@PathVariable Long studentId, 
                                    @RequestParam(defaultValue = "1") int page,
                                    @RequestParam(defaultValue = "10") int size,
                                    Model model) {
        List<TestResultDTO> allResults = testResultService.getResultsByStudent(studentId);
        
        // Pagination logic
        int totalResults = allResults.size();
        int totalPages = (int) Math.ceil((double) totalResults / size);
        int start = (page - 1) * size;
        int end = Math.min(start + size, totalResults);
        
        List<TestResultDTO> paginatedResults = start < totalResults ? 
                allResults.subList(start, end) : new ArrayList<>();
        
        StudentDTO student = studentService.getStudentById(studentId);
        
        model.addAttribute("results", paginatedResults);
        model.addAttribute("student", student);
        model.addAttribute("studentId", studentId);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("totalResults", totalResults);
        model.addAttribute("pageTitle", "学生のテスト結果");
        
        return "results/student-results";
    }

    @GetMapping("/add/{testId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN') or hasRole('TEACHER')")
    public String showAddFormWithTest(@PathVariable Long testId, Model model) {
        TestResultDTO resultDTO = new TestResultDTO();
        resultDTO.setTestId(testId);
        
        // Get test details to display
        testService.getTestById(testId).ifPresent(test -> {
            model.addAttribute("testName", test.getTestName());
            model.addAttribute("courseName", test.getCourseName());
            model.addAttribute("totalMarks", test.getTotalMarks());
        });
        
        model.addAttribute("result", resultDTO);
        model.addAttribute("tests", testService.getAllTests());
        
        testService.getTestById(testId).ifPresent(test -> {
            List<EnrollmentDTO> enrollments = enrollmentService.getEnrollmentsByCourse(test.getCourseId());
            model.addAttribute("enrollments", enrollments);
        });
        
        model.addAttribute("teachers", teacherService.getAllTeachers());
        
        return "results/form";
    }

    @GetMapping("/bulk-upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public String showBulkUploadForm(Model model) {
        model.addAttribute("tests", testService.getAllTests());
        return "results/bulk-upload";
    }

    @PostMapping("/bulk-upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public String processBulkUpload(@RequestParam("file") MultipartFile file,
                                    @RequestParam("testId") Long testId,
                                    RedirectAttributes redirectAttributes) {
        try {
            List<TestResultDTO> results = parseExcelFile(file, testId);
            testResultService.addBulkResults(results);
            redirectAttributes.addFlashAttribute("success", results.size() + "件の結果が正常にアップロードされました");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "アップロードに失敗しました: " + e.getMessage());
        }
        return "redirect:/results";
    }

    private List<TestResultDTO> parseExcelFile(MultipartFile file, Long testId) throws IOException {
        List<TestResultDTO> results = new ArrayList<>();
        
        org.apache.poi.ss.usermodel.Workbook workbook = org.apache.poi.ss.usermodel.WorkbookFactory.create(file.getInputStream());
        org.apache.poi.ss.usermodel.Sheet sheet = workbook.getSheetAt(0);
        
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            org.apache.poi.ss.usermodel.Row row = sheet.getRow(i);
            if (row == null) continue;
            
            TestResultDTO dto = new TestResultDTO();
            dto.setTestId(testId);
            
            org.apache.poi.ss.usermodel.Cell studentIdCell = row.getCell(0);
            String studentId = getCellValueAsString(studentIdCell);
            if (studentId == null || studentId.isEmpty()) continue;
            
            Long enrollmentId = findEnrollmentIdByStudentIdAndTestId(studentId, testId);
            if (enrollmentId == null) {
                continue;
            }
            dto.setEnrollmentId(enrollmentId);
            
            org.apache.poi.ss.usermodel.Cell scoreCell = row.getCell(1);
            dto.setScoreObtained(BigDecimal.valueOf(getCellValueAsDouble(scoreCell)));
            
            org.apache.poi.ss.usermodel.Cell feedbackCell = row.getCell(2);
            dto.setTeacherFeedback(getCellValueAsString(feedbackCell));
            
            results.add(dto);
        }
        
        workbook.close();
        return results;
    }

    private String getCellValueAsString(org.apache.poi.ss.usermodel.Cell cell) {
        if (cell == null) return null;
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                return String.valueOf((long) cell.getNumericCellValue());
            default:
                return null;
        }
    }

    private double getCellValueAsDouble(org.apache.poi.ss.usermodel.Cell cell) {
        if (cell == null) return 0;
        switch (cell.getCellType()) {
            case NUMERIC:
                return cell.getNumericCellValue();
            case STRING:
                try {
                    return Double.parseDouble(cell.getStringCellValue());
                } catch (NumberFormatException e) {
                    return 0;
                }
            default:
                return 0;
        }
    }

    private Long findEnrollmentIdByStudentIdAndTestId(String studentId, Long testId) {
        Optional<TestDTO> testOpt = testService.getTestById(testId);
        if (testOpt.isEmpty()) {
            return null;
        }
        
        Long courseId = testOpt.get().getCourseId();
        
        Optional<Student> studentOpt = studentService.findByStudentId(studentId);
        if (studentOpt.isEmpty()) {
            return null;
        }
        
        Optional<EnrollmentDTO> enrollmentOpt = enrollmentService.getActiveEnrollmentByStudentAndCourse(
            studentOpt.get().getId(), courseId);
        
        return enrollmentOpt.map(EnrollmentDTO::getEnrollmentId).orElse(null);
    }
}