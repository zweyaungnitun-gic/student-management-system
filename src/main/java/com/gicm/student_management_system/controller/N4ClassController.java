package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.entity.N4Class;
import com.gicm.student_management_system.service.N4ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequiredArgsConstructor
@RequestMapping("/students/{studentId}/n4-class") 
public class N4ClassController {

    private final N4ClassService n4ClassService;

    @GetMapping
    public String showN4ClassForm(@PathVariable("studentId") Long studentId, Model model) {
        
        N4Class n4Class = n4ClassService.getN4ClassByStudentId(studentId);

        model.addAttribute("n4Class", n4Class);
        model.addAttribute("studentId", studentId);
        
        return "n4-class-form"; 
    }

    
    @PostMapping
    public String saveN4ClassForm(
            @PathVariable("studentId") Long studentId,
            @ModelAttribute("n4Class") N4Class n4Class,
            RedirectAttributes redirectAttributes) {

        n4ClassService.saveOrUpdateN4Class(studentId, n4Class);

        redirectAttributes.addFlashAttribute("message", "N4クラス情報を正常に保存しました。");
        
        return "redirect:/students"; 
    }
}