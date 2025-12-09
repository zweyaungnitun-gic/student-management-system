package com.gicm.student_management_system.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import com.gicm.student_management_system.dto.StudentRegistrationDTO;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/register")
public class RegistrationController {

    // GET Mappings
    @GetMapping
    public String showRegistrationForm(HttpSession session, Model model) {
        // Retrieve existing data from Redis
        StudentRegistrationDTO studentData = (StudentRegistrationDTO) session.getAttribute("studentData");
        
        if (studentData != null) {
            // Pass data to view for pre-filling
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

    // POST Mappings
    @PostMapping("/save-step1")
    @ResponseBody
    public String saveStep1(@RequestBody StudentRegistrationDTO firstPageData, HttpSession session) {
        // Retrieve existing data from Redis (if user went back from second page)
        StudentRegistrationDTO existingData = (StudentRegistrationDTO) session.getAttribute("studentData");
        
        if (existingData != null) {
            // User came back from second page - preserve second page data
            // Only update first page fields
            existingData.setEnglishName(firstPageData.getEnglishName());
            existingData.setKatakanaName(firstPageData.getKatakanaName());
            existingData.setDob(firstPageData.getDob());
            existingData.setGender(firstPageData.getGender());
            existingData.setCurrentAddress(firstPageData.getCurrentAddress());
            existingData.setHometownAddress(firstPageData.getHometownAddress());
            existingData.setPhoneNumber(firstPageData.getPhoneNumber());
            existingData.setGuardianPhoneNumber(firstPageData.getGuardianPhoneNumber());
            
            // Keep existing second page data (fatherName, passportNumber, etc.)
            // Don't overwrite them!
            
            session.setAttribute("studentData", existingData);
        } else {
            // First time - no existing data
            session.setAttribute("studentData", firstPageData);
        }
        
        return "success";
    }

    @PostMapping("/save-step2")
    @ResponseBody
    public String saveStep2(@RequestBody StudentRegistrationDTO secondPageData, HttpSession session) {
        // Retrieve existing data from Redis
        StudentRegistrationDTO existingData = (StudentRegistrationDTO) session.getAttribute("studentData");
        
        if (existingData == null) {
            return "error";
        }
        
        // Merge second page data into existing data
        existingData.setFatherName(secondPageData.getFatherName());
        existingData.setPassportNumber(secondPageData.getPassportNumber());
        existingData.setNationalIdNumber(secondPageData.getNationalIdNumber());
        existingData.setJlptLevel(secondPageData.getJlptLevel());
        existingData.setDesiredOccupation(secondPageData.getDesiredOccupation());
        existingData.setOtherOccupation(secondPageData.getOtherOccupation());
        existingData.setJapanTravelExperience(secondPageData.getJapanTravelExperience());
        existingData.setCoeApplicationExperience(secondPageData.getCoeApplicationExperience());
        
        // Store combined data back to Redis
        session.setAttribute("studentData", existingData);
        
        return "success";
    }

    // POST Mapping for step 3
    @PostMapping("/save-step3")
    @ResponseBody
    public String saveStep3(@RequestBody StudentRegistrationDTO thirdPageData, HttpSession session) {
        StudentRegistrationDTO existingData = (StudentRegistrationDTO) session.getAttribute("studentData");

        if (existingData == null) {
            return "error";
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

        // Persist back to session/Redis
        session.setAttribute("studentData", existingData);

        return "success";
    }
}