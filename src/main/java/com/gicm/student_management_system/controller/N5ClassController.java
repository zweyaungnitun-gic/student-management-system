package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.dto.N5ClassDTO;
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

        N5ClassDTO n5ClassDTO = n5ClassService.getOrCreateN5ClassDTO(studentId);

        model.addAttribute("student", student);
        model.addAttribute("n5Class", n5ClassDTO);

        return "n5-class-form";
    }

    @PostMapping("/{id}/n5-class")
    public String saveN5ClassForm(@PathVariable("id") Long studentId,
            @ModelAttribute("n5Class") N5ClassDTO n5ClassDTO) {

        n5ClassService.saveN5ClassDTO(studentId, n5ClassDTO);

        return "redirect:/students";
    }
}