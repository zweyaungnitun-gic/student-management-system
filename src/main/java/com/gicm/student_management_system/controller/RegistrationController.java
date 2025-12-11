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
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.service.RegisterStudentService;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/register")
public class RegistrationController {

    private final RegisterStudentService registerStudentService;

    public RegistrationController(RegisterStudentService registerStudentService) {
        this.registerStudentService = registerStudentService;
    }

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
        
        if (existingData != null) {
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

    @PostMapping("/submit-final")
    @ResponseBody
    public ResponseEntity<String> submitFinal(HttpSession session) {
        try {
            StudentRegistrationDTO studentData = (StudentRegistrationDTO) session.getAttribute("studentData");
            
            if (studentData == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("error:セッションが無効です");
            }

            // Save to database
            Student savedStudent = registerStudentService.registerStudent(studentData);
            
            // Store student info in session for success page
            session.setAttribute("registeredStudentId", savedStudent.getStudentId());
            session.setAttribute("registeredStudentName", savedStudent.getStudentName());
            
            // Clear registration data
            session.removeAttribute("studentData");
            
            return ResponseEntity.ok("success");
            
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("error:" + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("error:登録中にエラーが発生しました");
        }
    }

    @GetMapping("/success")
    public String successPage(HttpSession session, Model model) {
        String studentId = (String) session.getAttribute("registeredStudentId");
        String studentName = (String) session.getAttribute("registeredStudentName");
        
        // Add to model for display
        model.addAttribute("studentId", studentId);
        model.addAttribute("studentName", studentName);
        
        // Clear these attributes after displaying
        session.removeAttribute("registeredStudentId");
        session.removeAttribute("registeredStudentName");
        
        return "register/success";
    }
}