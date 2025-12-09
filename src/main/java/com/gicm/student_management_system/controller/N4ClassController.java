package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.dto.N4ClassDTO;
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

    @GetMapping("/{id}/n4-class")
    public String showN4ClassForm(@PathVariable("id") Long studentId, Model model) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid student Id:" + studentId));

        N4ClassDTO n4ClassDTO = n4ClassService.getOrCreateN4ClassDTO(studentId); 

        model.addAttribute("student", student);
        model.addAttribute("n4Class", n4ClassDTO);

        return "n4-class-form";
    }

    @PostMapping("/{id}/n4-class")
    public String saveN5ClassForm(@PathVariable("id") Long studentId,
            @ModelAttribute("n4Class") N4ClassDTO n4ClassDTO) {

        n4ClassService.saveN4ClassDTO(studentId, n4ClassDTO);

        return "redirect:/students";
    }
}