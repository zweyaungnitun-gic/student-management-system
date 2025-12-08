package com.gicm.student_management_system.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/guest")
public class GuestDashboardController {

    @GetMapping("/dashboard")
    public String getGuestDashboard(Model model) {
        model.addAttribute("pageTitle", "Guest Dashboard");
        model.addAttribute("pageSubtitle", "Welcome, Guest");
        return "layouts/guest-dashboard";
    }
}
