package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.dto.CourseDTO;
import com.gicm.student_management_system.dto.StudentDTO;
import com.gicm.student_management_system.dto.TeacherDTO;
import com.gicm.student_management_system.service.CourseService;
import com.gicm.student_management_system.service.StudentService;
import com.gicm.student_management_system.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/guest")
@RequiredArgsConstructor
public class GuestDashboardController {

    private final StudentService studentService;
    private final CourseService courseService;
    private final TeacherService teacherService;

    @GetMapping("/dashboard")
    public String getGuestDashboard(Model model) {
        // Get recent students (last 5)
        List<StudentDTO> recentStudents = studentService.getAllStudents().stream()
                .limit(5)
                .collect(java.util.stream.Collectors.toList());
        
        // Get active courses
        List<CourseDTO> activeCourses = courseService.getActiveCourses().stream()
                .limit(5)
                .collect(java.util.stream.Collectors.toList());
        
        // Get teachers
        List<TeacherDTO> teachers = teacherService.getAllTeachers();
        
        model.addAttribute("recentStudents", recentStudents);
        model.addAttribute("activeCourses", activeCourses);
        model.addAttribute("teachers", teachers);
        model.addAttribute("pageTitle", "ゲストダッシュボード");
        
        return "layouts/guest-dashboard";
    }
}