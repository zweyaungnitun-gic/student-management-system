package com.gicm.student_management_system;

import com.gicm.student_management_system.controller.StudentController;
import com.gicm.student_management_system.dto.*;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.service.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.ui.ExtendedModelMap;
import org.springframework.ui.Model;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class StudentControllerTest_Detail {

    @Mock
    private StudentService studentService;

    @Mock
    private N5ClassService n5ClassService;

    @Mock
    private N4ClassService n4ClassService;

    @Mock
    private InterviewNotesService interviewNotesService;

    @InjectMocks
    private StudentController studentController;

    // to store data for the view
    private Model model;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // creates a fresh Model for each test
        model = new ExtendedModelMap();
    }

    // SUCCESS CASE
    @Test
    void showStudentDetails_success() {

        Long studentId = 1L;

        Student student = new Student();
        student.setId(studentId);

        // match what controller puts into model
        StudentDTO studentDTO = new StudentDTO();
        N5ClassDTO n5ClassDTO = new N5ClassDTO();
        N4ClassDTO n4ClassDTO = new N4ClassDTO();
        InterviewNotesDTO interviewNotesDTO = new InterviewNotesDTO();

        when(studentService.findById(studentId))
                .thenReturn(Optional.of(student));
        when(studentService.getStudentById(studentId))
                .thenReturn(studentDTO);
        when(n5ClassService.getOrCreateN5ClassDTO(studentId))
                .thenReturn(n5ClassDTO);
        when(n4ClassService.getOrCreateN4ClassDTO(studentId))
                .thenReturn(n4ClassDTO);
        when(interviewNotesService.getOrCreateInterviewNotesDTO(studentId))
                .thenReturn(interviewNotesDTO);

        String viewName = studentController.showStudentDetails(
                studentId,
                "personal",
                null,
                model
        );

        //confirms controller returns correct page
        assertEquals("students/student-details", viewName);
        // data required by student-details.html exists
        assertTrue(model.containsAttribute("student"));
        assertTrue(model.containsAttribute("n5Class"));
        assertTrue(model.containsAttribute("n4Class"));
        assertTrue(model.containsAttribute("interviewNotes"));
        // tab switching logic works //confirms the active tab is "personal"
        assertEquals("personal", model.getAttribute("currentTab"));

        // findByID() is exactly called once
        verify(studentService, times(1)).findById(studentId);
        verify(studentService, times(1)).getStudentById(studentId);
    }

    // DEFAULT TAB CASE
    //if no tab provided "personal" is used
    @Test
    void showStudentDetails_defaultTab() {

        Long studentId = 2L;

        Student student = new Student();
        student.setId(studentId);

        when(studentService.findById(studentId))
                .thenReturn(Optional.of(student));
        when(studentService.getStudentById(studentId))
                .thenReturn(new StudentDTO());
        when(n5ClassService.getOrCreateN5ClassDTO(studentId))
                .thenReturn(new N5ClassDTO());
        when(n4ClassService.getOrCreateN4ClassDTO(studentId))
                .thenReturn(new N4ClassDTO());
        when(interviewNotesService.getOrCreateInterviewNotesDTO(studentId))
                .thenReturn(new InterviewNotesDTO());

        String viewName = studentController.showStudentDetails(
                studentId,
                "personal",
                null,
                model
        );

        assertEquals("students/student-details", viewName);
        assertEquals("personal", model.getAttribute("currentTab"));
    }   

    // TAB + SUBTAB CASE
        @Test
        void showStudentDetails_n5TabWithSubTab() {

            Long studentId = 3L;

            Student student = new Student();
            student.setId(studentId);

            when(studentService.findById(studentId))
                    .thenReturn(Optional.of(student));
            when(studentService.getStudentById(studentId))
                    .thenReturn(new StudentDTO());
            when(n5ClassService.getOrCreateN5ClassDTO(studentId))
                    .thenReturn(new N5ClassDTO());
            when(n4ClassService.getOrCreateN4ClassDTO(studentId))
                    .thenReturn(new N4ClassDTO());
            when(interviewNotesService.getOrCreateInterviewNotesDTO(studentId))
                    .thenReturn(new InterviewNotesDTO());

            String viewName = studentController.showStudentDetails(
                    studentId,
                    "n5",
                    "class1",
                    model
            );

            assertEquals("students/student-details", viewName);
            assertEquals("n5", model.getAttribute("currentTab"));
            assertEquals("class1", model.getAttribute("currentSubTab"));
        }

    // STUDENT NOT FOUND
    @Test
    void showStudentDetails_studentNotFound() {

        Long studentId = 99L;

        when(studentService.findById(studentId))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> studentController.showStudentDetails(
                        studentId,
                        "personal",
                        null,
                        model
                )
        );

        assertTrue(exception.getMessage().contains("Student not found"));
    }
}
