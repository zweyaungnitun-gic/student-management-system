package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.dto.InterviewNotesDTO;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.service.InterviewNotesService;
import com.gicm.student_management_system.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequiredArgsConstructor
@RequestMapping("/students")
public class InterviewNotesController {

    private final InterviewNotesService interviewNotesService;
    private final StudentRepository studentRepository;

    @GetMapping("/{id}/interview-notes")
    public String showInterviewNotesForm(@PathVariable("id") Long studentId, Model model) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid student Id:" + studentId));

        InterviewNotesDTO interviewNotesDTO = interviewNotesService.getOrCreateInterviewNotesDTO(studentId);

        model.addAttribute("student", student);
        model.addAttribute("interviewNotes", interviewNotesDTO);

        return "interview-notes-form";
    }

    @PostMapping("/{id}/interview-notes")
    public String saveInterviewNotesForm(@PathVariable("id") Long studentId,
            @ModelAttribute("interviewNotes") InterviewNotesDTO interviewNotesDTO) {

        interviewNotesService.saveInterviewNotesDTO(studentId, interviewNotesDTO);

        return "redirect:/students";
    }
}