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
        EmployeeStats stats = employeeService.getEmployeeStats();
        model.addAttribute("employeeStats", stats);
        return "layouts/admin-dashboard";
    }
}


