package com.gicm.student_management_system.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    @GetMapping({"/dashboard", "/entity"})
    public String getDashboard(Model model) {
        model.addAttribute("pageTitle", "Dashboard");
        model.addAttribute("pageSubtitle", "Welcome back");
        return "layouts/admin-dashboard";
    }
}


