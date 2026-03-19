package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.dto.StudentDTO;
import com.gicm.student_management_system.dto.CourseDTO;
import com.gicm.student_management_system.entity.RegistrationStatus;
import com.gicm.student_management_system.entity.StudentRegistration;
import com.gicm.student_management_system.service.StudentService;
import com.gicm.student_management_system.service.StudentRegistrationService;
import com.gicm.student_management_system.service.UserService;
import com.gicm.student_management_system.service.TeacherService;
import com.gicm.student_management_system.service.CourseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
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
        log.info("=== DASHBOARD DATA FETCH ===");
        
        List<StudentDTO> allStudents = studentService.getAllStudents();
        log.info("Total Students in database: {}", allStudents.size());
        
        // Get counts
        int totalStudents = allStudents.size();
        int totalTeachers = teacherService.getAllTeachers().size();
        int totalCourses = courseService.getAllCourses().size();
        int totalUsers = userService.getAllUsers().size();
        
        log.info("Total Students: {}", totalStudents);
        log.info("Total Teachers: {}", totalTeachers);
        log.info("Total Courses: {}", totalCourses);
        log.info("Total Users: {}", totalUsers);
        
        model.addAttribute("totalStudents", totalStudents);
        model.addAttribute("totalTeachers", totalTeachers);
        model.addAttribute("totalCourses", totalCourses);
        model.addAttribute("totalUsers", totalUsers);

        // Pending registrations
        long pendingCount = studentRegistrationService.countByStatus(RegistrationStatus.PENDING);
        log.info("Pending Registrations: {}", pendingCount);
        model.addAttribute("pendingRegistrations", pendingCount);
        
        List<StudentRegistration> recentAccepted = studentRegistrationService.listRecentAccepted(5);
        log.info("Recent Accepted Registrations: {}", recentAccepted.size());
        model.addAttribute("recentAcceptedRegistrations", recentAccepted);
        
        List<StudentDTO> recentStudents = allStudents.stream()
            .limit(5)
            .collect(Collectors.toList());
        
        log.info("Recent Students showing: {}", recentStudents.size());
        if (!recentStudents.isEmpty()) {
            recentStudents.forEach(s -> 
                log.info("  - Student: {} ({})", s.getStudentName(), s.getStudentId())
            );
        }
        model.addAttribute("recentStudents", recentStudents);
        
        List<CourseDTO> activeCourses = courseService.getActiveCourses().stream()
            .limit(5)
            .collect(Collectors.toList());
        
        log.info("Active Courses showing: {}", activeCourses.size());
        if (!activeCourses.isEmpty()) {
            activeCourses.forEach(c -> 
                log.info("  - Course: {} ({})", c.getCourseName(), c.getCourseCode())
            );
        }
        model.addAttribute("activeCourses", activeCourses);
        
        log.info("=== DASHBOARD DATA FETCH COMPLETE ===");
        
        return "dashboard/main";
    }
}