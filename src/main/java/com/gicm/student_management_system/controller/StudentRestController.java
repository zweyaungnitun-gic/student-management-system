package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.service.StudentService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
public class StudentRestController {

    private final StudentService studentService;

    StudentRestController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/check-duplicate-id")
    public boolean checkDuplicate(
            @RequestParam String nationalId,
            @RequestParam(required = false) Long excludeId) {
        return studentService.isNationalIdDuplicate(nationalId, excludeId);
    }
}