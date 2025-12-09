package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.entity.N4Class;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.service.N4ClassService;
import com.gicm.student_management_system.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequiredArgsConstructor
@RequestMapping("/students")
public class N4ClassController {

    private final N4ClassService n4ClassService;
    private final StudentRepository studentRepository;

    // Show the N5 Class Form for a specific student
    @GetMapping("/{id}/n4-class")
    public String showN4ClassForm(@PathVariable("id") Long studentId, Model model) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid student Id:" + studentId));
        
        N4Class n4Class = n4ClassService.getOrCreateN4Class(studentId);

        model.addAttribute("student", student);
        model.addAttribute("n4Class", n4Class);
        
        return "n4-class-form"; 
    }

    @PostMapping("/{id}/n4-class")
    public String saveN5ClassForm(@PathVariable("id") Long studentId, 
                                  @ModelAttribute("n4Class") N4Class n4Class) {
        
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid student Id:" + studentId));
        n4Class.setStudent(student);
        
        n4ClassService.saveN4Class(n4Class);
        
        return "redirect:/students"; 
    }
}