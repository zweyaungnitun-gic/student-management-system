package com.gicm.student_management_system.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/")
    public String getAdminTest(Model model) {
        model.addAttribute("pageTitle", "Admin Test Page");
        return "test";
    }
}
