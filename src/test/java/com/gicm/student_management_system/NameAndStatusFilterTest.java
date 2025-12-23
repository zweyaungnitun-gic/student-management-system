package com.gicm.student_management_system;

import com.gicm.student_management_system.controller.StudentController;
import com.gicm.student_management_system.dto.StudentDTO;
import com.gicm.student_management_system.service.StudentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ui.Model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NameAndStatusFilterTest {

    @Mock
    private StudentService studentService;

    @Mock
    private Model model;

    @InjectMocks
    private StudentController studentController;

    private List<StudentDTO> allStudents;

    @BeforeEach
    void setup() {
        allStudents = new ArrayList<>();
        allStudents.add(StudentDTO.builder().id(1L).studentName("Alice").status("在校").build());
        allStudents.add(StudentDTO.builder().id(2L).studentName("Bob").status("卒業").build());
        allStudents.add(StudentDTO.builder().id(3L).studentName("Charlie").status("途中退校").build());
    }

    // ===== STATUS-ONLY TESTS =====
    // @Test
    // void testStatusSingle() {
    // // Use mutable list
    // List<String> statuses = new ArrayList<>();
    // statuses.add("在校");

    // // Prepare mutable filtered list
    // List<StudentDTO> filtered = new ArrayList<>();
    // filtered.add(allStudents.get(0));

    // // Mock service
    // when(studentService.getStudentsByStatuses("",
    // statuses)).thenReturn(filtered);

    // // Call controller
    // String view = studentController.getStudents("", "在校", model);

    // // Verify
    // assertEquals("students/student-list", view);
    // verify(studentService, times(1)).getStudentsByStatuses("", statuses);
    // verify(model).addAttribute("students", filtered);
    // }

    // @Test
    // void testStatusMultiple() {
    // String status = "在校,卒業";

    // // Convert to mutable list
    // List<String> statuses = new ArrayList<>(Arrays.asList(status.split(",")));

    // // Prepare mutable filtered list
    // List<StudentDTO> filtered = new ArrayList<>();
    // filtered.add(allStudents.get(0));
    // filtered.add(allStudents.get(1));

    // // Mock service
    // when(studentService.getStudentsByStatuses("",
    // statuses)).thenReturn(filtered);

    // // Call controller
    // String view = studentController.getStudents("", status, model);

    // // Verify
    // assertEquals("students/student-list", view);
    // verify(studentService, times(1)).getStudentsByStatuses("", statuses);
    // verify(model).addAttribute("students", filtered);
    // }

    // ===== STATUS-ONLY TESTS (individual) =====

    @Test
    void testStatusAtSchool() {
        List<String> statuses = new ArrayList<>();
        statuses.add("在校");

        List<StudentDTO> filtered = new ArrayList<>();
        filtered.add(allStudents.get(0)); // assume first student has status "在校"

        when(studentService.getStudentsByStatuses("", statuses)).thenReturn(filtered);

        String view = studentController.getStudents("", "在校", model);

        assertEquals("students/student-list", view);
        verify(studentService, times(1)).getStudentsByStatuses("", statuses);
        verify(model).addAttribute("students", filtered);
    }

    @Test
    void testStatusGraduated() {
        List<String> statuses = new ArrayList<>();
        statuses.add("卒業");

        List<StudentDTO> filtered = new ArrayList<>();
        filtered.add(allStudents.get(1)); // assume second student has status "卒業"

        when(studentService.getStudentsByStatuses("", statuses)).thenReturn(filtered);

        String view = studentController.getStudents("", "卒業", model);

        assertEquals("students/student-list", view);
        verify(studentService, times(1)).getStudentsByStatuses("", statuses);
        verify(model).addAttribute("students", filtered);
    }

    @Test
    void testStatusDroppedOut() {
        List<String> statuses = new ArrayList<>();
        statuses.add("途中退校");

        List<StudentDTO> filtered = new ArrayList<>();
        filtered.add(allStudents.get(2)); // assume third student has status "途中退校"

        when(studentService.getStudentsByStatuses("", statuses)).thenReturn(filtered);

        String view = studentController.getStudents("", "途中退校", model);

        assertEquals("students/student-list", view);
        verify(studentService, times(1)).getStudentsByStatuses("", statuses);
        verify(model).addAttribute("students", filtered);
    }

    @Test
    void testStatusAtSchoolGraduated() {
        String status = "在校,卒業";
        List<String> statuses = new ArrayList<>(Arrays.asList(status.split(",")));

        List<StudentDTO> filtered = new ArrayList<>();
        filtered.add(allStudents.get(0));
        filtered.add(allStudents.get(1));

        when(studentService.getStudentsByStatuses("", statuses)).thenReturn(filtered);

        String view = studentController.getStudents("", status, model);

        assertEquals("students/student-list", view);
        verify(studentService, times(1)).getStudentsByStatuses("", statuses);
        verify(model).addAttribute("students", filtered);
    }

    @Test
    void testStatusGraduatedDroppedOut() {
        String status = "卒業,途中退校";
        List<String> statuses = new ArrayList<>(Arrays.asList(status.split(",")));

        List<StudentDTO> filtered = new ArrayList<>();
        filtered.add(allStudents.get(1));
        filtered.add(allStudents.get(2));

        when(studentService.getStudentsByStatuses("", statuses)).thenReturn(filtered);

        String view = studentController.getStudents("", status, model);

        assertEquals("students/student-list", view);
        verify(studentService, times(1)).getStudentsByStatuses("", statuses);
        verify(model).addAttribute("students", filtered);
    }

    @Test
    void testStatusAtSchoolDroppedOut() {
        String status = "在校,途中退校";
        List<String> statuses = new ArrayList<>(Arrays.asList(status.split(",")));

        List<StudentDTO> filtered = new ArrayList<>();
        filtered.add(allStudents.get(0));
        filtered.add(allStudents.get(2));

        when(studentService.getStudentsByStatuses("", statuses)).thenReturn(filtered);

        String view = studentController.getStudents("", status, model);

        assertEquals("students/student-list", view);
        verify(studentService, times(1)).getStudentsByStatuses("", statuses);
        verify(model).addAttribute("students", filtered);
    }

    @Test
    void testStatusAllThree() {
        String status = "在校,卒業,途中退校";
        List<String> statuses = new ArrayList<>(Arrays.asList(status.split(",")));

        List<StudentDTO> filtered = new ArrayList<>(allStudents);

        when(studentService.getStudentsByStatuses("", statuses)).thenReturn(filtered);

        String view = studentController.getStudents("", status, model);

        assertEquals("students/student-list", view);
        verify(studentService, times(1)).getStudentsByStatuses("", statuses);
        verify(model).addAttribute("students", filtered);
    }

    // ===== NAME-ONLY TESTS =====
    // ===== NAME-ONLY TESTS =====

    @Test
    void testNameSearchAliceUpper() {
        String name = "Alice";
        List<StudentDTO> filtered = new ArrayList<>();
        filtered.add(allStudents.get(0));

        when(studentService.getStudentsByStatuses(name, new ArrayList<>())).thenReturn(filtered);

        String view = studentController.getStudents(name, "", model);

        assertEquals("students/student-list", view);
        verify(studentService, times(1)).getStudentsByStatuses(name, new ArrayList<>());
        verify(model).addAttribute("students", filtered);
    }

    @Test
    void testNameSearchAliceLower() {
        String name = "alice";
        List<StudentDTO> filtered = new ArrayList<>();
        filtered.add(allStudents.get(0));

        when(studentService.getStudentsByStatuses(name, new ArrayList<>())).thenReturn(filtered);

        String view = studentController.getStudents(name, "", model);

        assertEquals("students/student-list", view);
        verify(studentService, times(1)).getStudentsByStatuses(name, new ArrayList<>());
        verify(model).addAttribute("students", filtered);
    }

    @Test
    void testNameSearchBobUpper() {
        String name = "BOB";
        List<StudentDTO> filtered = new ArrayList<>();
        filtered.add(allStudents.get(1));

        when(studentService.getStudentsByStatuses(name, new ArrayList<>())).thenReturn(filtered);

        String view = studentController.getStudents(name, "", model);

        assertEquals("students/student-list", view);
        verify(studentService, times(1)).getStudentsByStatuses(name, new ArrayList<>());
        verify(model).addAttribute("students", filtered);
    }

    @Test
    void testNameSearchCharlieLower() {
        String name = "charlie";
        List<StudentDTO> filtered = new ArrayList<>();
        filtered.add(allStudents.get(2));

        when(studentService.getStudentsByStatuses(name, new ArrayList<>())).thenReturn(filtered);

        String view = studentController.getStudents(name, "", model);

        assertEquals("students/student-list", view);
        verify(studentService, times(1)).getStudentsByStatuses(name, new ArrayList<>());
        verify(model).addAttribute("students", filtered);
    }

    // ===== PARTIAL NAME TEST =====
    @Test
    void testNameSearchPartialAli() {
        String name = "Ali"; // partial of "Alice"
        List<StudentDTO> filtered = new ArrayList<>();
        filtered.add(allStudents.get(0)); // Alice matches "Ali"

        when(studentService.getStudentsByStatuses(name, new ArrayList<>())).thenReturn(filtered);

        String view = studentController.getStudents(name, "", model);

        assertEquals("students/student-list", view);
        verify(studentService, times(1)).getStudentsByStatuses(name, new ArrayList<>());
        verify(model).addAttribute("students", filtered);
    }

    // ===== STATUS + NAME SINGLE TESTS =====
    @Test
    void testAliceWithStatusZaiKo() {
        String name = "Alice";
        String status = "在校";
        List<String> statuses = new ArrayList<>(List.of(status));
        List<StudentDTO> filtered = new ArrayList<>(List.of(allStudents.get(0))); // <-- mutable

        when(studentService.getStudentsByStatuses(name, statuses)).thenReturn(filtered);

        String view = studentController.getStudents(name, status, model);

        assertEquals("students/student-list", view);
        verify(studentService, times(1)).getStudentsByStatuses(name, statuses);
        verify(model).addAttribute("students", filtered);
    }

    @Test
    void testBobWithStatusSotsugyo() {
        String name = "Bob";
        String status = "卒業";
        List<String> statuses = new ArrayList<>(List.of(status));
        List<StudentDTO> filtered = new ArrayList<>(List.of(allStudents.get(1))); // <-- mutable

        when(studentService.getStudentsByStatuses(name, statuses)).thenReturn(filtered);

        String view = studentController.getStudents(name, status, model);

        assertEquals("students/student-list", view);
        verify(studentService, times(1)).getStudentsByStatuses(name, statuses);
        verify(model).addAttribute("students", filtered);
    }

    @Test
    void testCharlieWithStatusTochuTaikou() {
        String name = "Charlie";
        String status = "途中退校";
        List<String> statuses = new ArrayList<>(List.of(status));
        List<StudentDTO> filtered = new ArrayList<>(List.of(allStudents.get(2))); // <-- mutable

        when(studentService.getStudentsByStatuses(name, statuses)).thenReturn(filtered);

        String view = studentController.getStudents(name, status, model);

        assertEquals("students/student-list", view);
        verify(studentService, times(1)).getStudentsByStatuses(name, statuses);
        verify(model).addAttribute("students", filtered);
    }

    @Test
    void testAliceWithStatusZaiKoSotsugyo() {
        String name = "Alice";
        String status = "在校,卒業";
        List<String> statuses = new ArrayList<>(List.of("在校", "卒業"));
        List<StudentDTO> filtered = new ArrayList<>(List.of(allStudents.get(0))); // <-- mutable

        when(studentService.getStudentsByStatuses(name, statuses)).thenReturn(filtered);

        String view = studentController.getStudents(name, status, model);

        assertEquals("students/student-list", view);
        verify(studentService, times(1)).getStudentsByStatuses(name, statuses);
        verify(model).addAttribute("students", filtered);
    }

    @Test
    void testBobWithStatusSotsugyoTochuTaikou() {
        String name = "Bob";
        String status = "卒業,途中退校";
        List<String> statuses = new ArrayList<>(List.of("卒業", "途中退校"));
        List<StudentDTO> filtered = new ArrayList<>(List.of(allStudents.get(1))); // <-- mutable

        when(studentService.getStudentsByStatuses(name, statuses)).thenReturn(filtered);

        String view = studentController.getStudents(name, status, model);

        assertEquals("students/student-list", view);
        verify(studentService, times(1)).getStudentsByStatuses(name, statuses);
        verify(model).addAttribute("students", filtered);
    }
}
