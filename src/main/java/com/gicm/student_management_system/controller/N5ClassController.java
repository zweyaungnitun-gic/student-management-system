package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.entity.N5Class;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.service.N5ClassService;
import com.gicm.student_management_system.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequiredArgsConstructor
@RequestMapping("/students")
public class N5ClassController {

    private final N5ClassService n5ClassService;
    private final StudentRepository studentRepository;

    @GetMapping("/{id}/n5-class")
    public String showN5ClassForm(@PathVariable("id") Long studentId, Model model) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid student Id:" + studentId));

        N5Class n5Class = n5ClassService.getOrCreateN5Class(studentId);

        model.addAttribute("student", student);
        model.addAttribute("n5Class", n5Class);

        return "n5-class-form";
    }

    @PostMapping("/{id}/n5-class")
    public String saveN5ClassForm(@PathVariable("id") Long studentId,
            @ModelAttribute("n5Class") N5Class n5Class) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid student Id:" + studentId));
        n5Class.setStudent(student);

        n5ClassService.saveN5Class(n5Class);

        return "redirect:/students";
    }
}