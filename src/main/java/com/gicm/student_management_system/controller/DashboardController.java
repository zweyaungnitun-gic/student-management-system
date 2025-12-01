package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.dto.EmployeeStats;
import com.gicm.student_management_system.service.EmployeeService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    private final EmployeeService employeeService;

    public DashboardController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping({"/", "/dashboard", "/entity"})
    public String getDashboard(Model model) {
        model.addAttribute("pageTitle", "Admin Dashboard");
        model.addAttribute("pageSubtitle", "Welcome back");
        return "layouts/admin-dashboard";
    }
}


