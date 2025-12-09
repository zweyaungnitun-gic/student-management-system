package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.dto.StudentDTO;
import com.gicm.student_management_system.entity.InterviewNotes;
import com.gicm.student_management_system.entity.N4Class;
import com.gicm.student_management_system.entity.N5Class;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.service.StudentService;
import com.gicm.student_management_system.service.N5ClassService;
import com.gicm.student_management_system.service.N4ClassService;

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

    @GetMapping("/student-update/{id}")
    public String showUpdateForm(@PathVariable Long id, Model model) {

        Student student = studentService.findById(id)
                .orElseThrow(() -> new RuntimeException("生徒が見つかりません: ID " + id));

        if (student.getN5Class() == null) {
            N5Class n5Class = N5Class.builder()
                    .student(student)
                    .build();
            student.setN5Class(n5Class);
        }

        if (student.getN4Class() == null) {
            N4Class n4Class = N4Class.builder()
                    .student(student)
                    .build();
            student.setN4Class(n4Class);
        }

        if (student.getInterviewNotes() == null) {
            InterviewNotes interviewNotes = InterviewNotes.builder()
                    .student(student)
                    .build();
            student.setInterviewNotes(interviewNotes);
        }

        model.addAttribute("student", student);
        model.addAttribute("isNew", false);
        return "students/student-update";

    }

}