package com.gicm.student_management_system.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.gicm.student_management_system.service.EmployeeService;

@Controller
public class DashboardController {

    private final EmployeeService employeeService;

    public DashboardController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping({"/", "/dashboard", "/entity"})
    public String getDashboard(Model model) {
        model.addAttribute("pageTitle", "Dashboard");
        model.addAttribute("pageSubtitle", "Welcome back");
        return "layouts/admin-dashboard";
    }

    @GetMapping("/test")
    public String getTestPage(Model model) {
        model.addAttribute("pageTitle", "Test Page");
        return "test";
    }
}


