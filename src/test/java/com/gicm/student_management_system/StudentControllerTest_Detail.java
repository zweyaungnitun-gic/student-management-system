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

        private Model model;

        @BeforeEach
        void setUp() {
                MockitoAnnotations.openMocks(this);
                model = new ExtendedModelMap();
        }

        // SUCCESS CASE
        @Test
        void showStudentDetails_success() {

                Long studentId = 1L;

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
                                "", // nameSearch
                                "", // status
                                model);

                assertEquals("students/student-details", viewName);
                assertTrue(model.containsAttribute("student"));
                assertTrue(model.containsAttribute("n5Class"));
                assertTrue(model.containsAttribute("n4Class"));
                assertTrue(model.containsAttribute("interviewNotes"));
                assertEquals("personal", model.getAttribute("currentTab"));

                verify(studentService).findById(studentId);
                verify(studentService).getStudentById(studentId);
        }

        // DEFAULT TAB CASE
        @Test
        void showStudentDetails_defaultTab() {

                Long studentId = 2L;

                when(studentService.findById(studentId))
                                .thenReturn(Optional.of(new Student()));
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
                                "",
                                "",
                                model);

                assertEquals("students/student-details", viewName);
                assertEquals("personal", model.getAttribute("currentTab"));
        }

        // TAB + SUBTAB CASE
        @Test
        void showStudentDetails_n5TabWithSubTab() {

                Long studentId = 3L;

                when(studentService.findById(studentId))
                                .thenReturn(Optional.of(new Student()));
                when(studentService.getStudentById(studentId))
                                .thenReturn(new StudentDTO());
                when(n5ClassService.getOrCreateN5ClassDTO(studentId))
                                .thenReturn(new N5ClassDTO());
                when(n4ClassService.getOrCreateN4ClassDTO(studentId))
                                .thenReturn(new N4ClassDTO());
                when(interviewNotesService.getOrCreateInterviewNotesDTO(studentId))
                                .thenReturn(new InterviewNotesDTO());

                String viewName = studentController.showStudentDetails(
                                studentId, // @PathVariable Long id
                                "n5", // @RequestParam tab
                                "class1", // @RequestParam subTab
                                "", // @RequestParam nameSearch
                                "", // @RequestParam status
                                model // Model
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
                                                "",
                                                "",
                                                model));

                assertTrue(exception.getMessage().contains("Student not found"));
        }
}
