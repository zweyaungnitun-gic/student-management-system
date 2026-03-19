package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.service.StudentService;
import com.gicm.student_management_system.service.StudentRegistrationService;
import com.gicm.student_management_system.service.UserService;
import com.gicm.student_management_system.service.TeacherService;
import com.gicm.student_management_system.service.CourseService;
import com.gicm.student_management_system.entity.RegistrationStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class DashboardController {

    private final StudentService studentService;
    private final UserService userService;
    private final TeacherService teacherService;
    private final CourseService courseService;
    private final StudentRegistrationService studentRegistrationService;

    @GetMapping("/dashboard")
    public String showDashboard(Model model) {
        // Get counts
        model.addAttribute("totalStudents", studentService.getAllStudents().size());
        model.addAttribute("totalTeachers", teacherService.getAllTeachers().size());
        model.addAttribute("totalCourses", courseService.getAllCourses().size());
        model.addAttribute("totalUsers", userService.getAllUsers().size());

        model.addAttribute("pendingRegistrations", studentRegistrationService.countByStatus(RegistrationStatus.PENDING));
        model.addAttribute("recentAcceptedRegistrations", studentRegistrationService.listRecentAccepted(5));
        
        // Get recent students (last 5)
        model.addAttribute("recentStudents", 
            studentService.getAllStudents().stream()
                .limit(5)
                .collect(java.util.stream.Collectors.toList()));
        
        // Get active courses
        model.addAttribute("activeCourses", courseService.getActiveCourses().stream()
            .limit(5)
            .collect(java.util.stream.Collectors.toList()));
        
        return "dashboard/main";
    }
}