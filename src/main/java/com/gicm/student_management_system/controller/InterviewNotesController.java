package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.entity.InterviewNotes;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.service.InterviewNotesService;
import com.gicm.student_management_system.service.StudentService; // Assuming you need this for student context
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequiredArgsConstructor
@RequestMapping("/students")
public class InterviewNotesController {

    // Inject the InterviewNotesService, fulfilling the core request
    private final InterviewNotesService interviewNotesService;
    private final StudentService studentService; 

    /**
     * Handles the GET request to retrieve Interview Notes data for a specific student.
     * This method demonstrates the controller using the service.
     * The path /{id}/interview-notes is used here, similar to /{id}/n5-class.
     * * @param studentId The ID of the student.
     * @param model The Spring UI Model for passing data to the view.
     * @return The name of the Thymeleaf template to render.
     */
    @GetMapping("/{id}/interview-notes")
    public String showInterviewNotes(@PathVariable("id") Long studentId, Model model) {
        
        // Use the service to fetch the notes entity (or create a new one if it doesn't exist)
        InterviewNotes interviewNotesEntity = interviewNotesService.getOrCreateInterviewNotes(studentId);

        // Fetch the Student entity for necessary context (e.g., header display)
        Student student = studentService.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid student Id: " + studentId));

        // Add both objects to the model
        model.addAttribute("student", student);
        model.addAttribute("interviewNotes", interviewNotesEntity);
        
        // NOTE: This assumes you have a dedicated view file named 'interview-notes-view.html' 
        // for this controller to return.
        return "interview-notes-view";
    }

    // IMPORTANT: The @PostMapping("/update-interview/{id}") method remains in 
    // StudentController.java as per your explicit request.
}