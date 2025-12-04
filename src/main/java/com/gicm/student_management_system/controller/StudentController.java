package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.dto.StudentDTO;
import com.gicm.student_management_system.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.ui.Model;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/students")
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    public String getStudents(@RequestParam(value = "nameSearch", defaultValue = "") String nameSearch,
                              @RequestParam(value = "status", defaultValue = "") String status,
                              Model model) {

        List<StudentDTO> students = studentService.getStudentsByFilter(nameSearch, status);

        model.addAttribute("students", students);
        model.addAttribute("nameSearch", nameSearch);
        model.addAttribute("statusFilter", status);

        return "admin-dashboard"; 
    }
}
