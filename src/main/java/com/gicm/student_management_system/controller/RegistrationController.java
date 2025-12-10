package com.gicm.student_management_system.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.gicm.student_management_system.dto.StudentRegistrationDTO;
import com.gicm.student_management_system.dto.validation.FirstPageValidation;
import com.gicm.student_management_system.dto.validation.SecondPageValidation;
import com.gicm.student_management_system.dto.validation.ThirdPageValidation;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/register")
// REMOVED @Validated - this was causing the issue
public class RegistrationController {

    @GetMapping
    public String showRegistrationForm(HttpSession session, Model model) {
        StudentRegistrationDTO studentData = (StudentRegistrationDTO) session.getAttribute("studentData");
        
        if (studentData != null) {
            model.addAttribute("studentData", studentData);
        }
        
        return "register/register";
    }

    @GetMapping("/second-page")
    public String secondPage(HttpSession session, Model model) {
        StudentRegistrationDTO studentData = (StudentRegistrationDTO) session.getAttribute("studentData");
        
        if (studentData != null) {
            model.addAttribute("studentData", studentData);
        }

        return "register/second-page";
    }

    @GetMapping("/third-page")
    public String thirdPage(HttpSession session, Model model) {
        StudentRegistrationDTO studentData = (StudentRegistrationDTO) session.getAttribute("studentData");
        
        if (studentData != null) {
            model.addAttribute("studentData", studentData);
        }

        return "register/third-page";
    }

    @GetMapping("/check-page")
    public String checkPage(HttpSession session, Model model) {
        StudentRegistrationDTO studentData = (StudentRegistrationDTO) session.getAttribute("studentData");
        
        if (studentData != null) {
            model.addAttribute("studentData", studentData);
            return "register/check-page";
        }
        
        return "redirect:/register";
    }

    @PostMapping("/save-step1")
    @ResponseBody
    public ResponseEntity<?> saveStep1(
            @Validated(FirstPageValidation.class) @RequestBody StudentRegistrationDTO firstPageData,
            BindingResult bindingResult,
            HttpSession session) {
        
        // Check for validation errors
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> 
                errors.put(error.getField(), error.getDefaultMessage())
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("errors", errors);
            
            return ResponseEntity.badRequest().body(response);
        }
        
        // Validation passed - proceed with saving
        StudentRegistrationDTO existingData = (StudentRegistrationDTO) session.getAttribute("studentData");
        
        if (existingData != null) {
            // Update first page fields only
            existingData.setEnglishName(firstPageData.getEnglishName());
            existingData.setKatakanaName(firstPageData.getKatakanaName());
            existingData.setDob(firstPageData.getDob());
            existingData.setGender(firstPageData.getGender());
            existingData.setCurrentAddress(firstPageData.getCurrentAddress());
            existingData.setHometownAddress(firstPageData.getHometownAddress());
            existingData.setPhoneNumber(firstPageData.getPhoneNumber());
            existingData.setGuardianPhoneNumber(firstPageData.getGuardianPhoneNumber());
            
            session.setAttribute("studentData", existingData);
        } else {
            session.setAttribute("studentData", firstPageData);
        }
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/save-step2")
    @ResponseBody
    public ResponseEntity<?> saveStep2(
            @Validated(SecondPageValidation.class) @RequestBody StudentRegistrationDTO secondPageData,
            BindingResult bindingResult,
            HttpSession session) {

        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
            );

            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("errors", errors);
            return ResponseEntity.badRequest().body(response);
        }

        StudentRegistrationDTO existingData = (StudentRegistrationDTO) session.getAttribute("studentData");

        if (existingData == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("status", "error", "message", "セッションが無効です"));
        }

        // Merge second page data
        existingData.setFatherName(secondPageData.getFatherName());
        existingData.setPassportNumber(secondPageData.getPassportNumber());
        existingData.setNationalIdNumber(secondPageData.getNationalIdNumber());
        existingData.setJlptLevel(secondPageData.getJlptLevel());
        existingData.setDesiredOccupation(secondPageData.getDesiredOccupation());
        existingData.setOtherOccupation(secondPageData.getOtherOccupation());
        existingData.setJapanTravelExperience(secondPageData.getJapanTravelExperience());
        existingData.setCoeApplicationExperience(secondPageData.getCoeApplicationExperience());

        session.setAttribute("studentData", existingData);

        return ResponseEntity.ok(Map.of("status", "success"));
    }

    @PostMapping("/save-step3")
    @ResponseBody
    public ResponseEntity<?> saveStep3(
            @Validated(ThirdPageValidation.class) @RequestBody StudentRegistrationDTO thirdPageData,
            BindingResult bindingResult,
            HttpSession session) {
        
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> 
                errors.put(error.getField(), error.getDefaultMessage())
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("errors", errors);
            
            return ResponseEntity.badRequest().body(response);
        }
        
        StudentRegistrationDTO existingData = (StudentRegistrationDTO) session.getAttribute("studentData");

        if (existingData == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("status", "error", "message", "セッションが無効です"));
        }

        // Merge third-page fields
        existingData.setReligion(thirdPageData.getReligion());
        existingData.setOtherReligion(thirdPageData.getOtherReligion());
        existingData.setSmoking(thirdPageData.getSmoking());
        existingData.setAlcohol(thirdPageData.getAlcohol());
        existingData.setTattoo(thirdPageData.getTattoo());
        existingData.setTuitionPaymentDate(thirdPageData.getTuitionPaymentDate());
        existingData.setWantDorm(thirdPageData.getWantDorm());
        existingData.setOtherMemo(thirdPageData.getOtherMemo());

        session.setAttribute("studentData", existingData);

        return ResponseEntity.ok(Map.of("status", "success"));
    }
}