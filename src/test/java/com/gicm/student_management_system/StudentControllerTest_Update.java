package com.gicm.student_management_system;

import com.gicm.student_management_system.dto.N4ClassDTO;
import com.gicm.student_management_system.dto.N5ClassDTO;
import com.gicm.student_management_system.controller.StudentController;
import com.gicm.student_management_system.dto.InterviewNotesDTO;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.service.N5ClassService;
import com.gicm.student_management_system.service.N4ClassService;
import com.gicm.student_management_system.service.StudentService;
import com.gicm.student_management_system.service.InterviewNotesService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.ObjectError;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.servlet.mvc.support.RedirectAttributesModelMap;

import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentControllerTest_Update {

    @Mock
    private StudentService studentService;

    @Mock
    private N5ClassService n5ClassService;

    @Mock
    private N4ClassService n4ClassService;

    @Mock
    private InterviewNotesService interviewNotesService;

    @Mock
    private Model model;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private StudentController studentController;

    private Student testStudent;
    private Long studentId = 1L;
    private String nameSearch = "";
    private String status = "";

    @BeforeEach
    void setUp() {
        testStudent = new Student();
        testStudent.setId(studentId);
        testStudent.setStudentName("John Doe");
        testStudent.setNameInJapanese("ジョン・ドウ");
        testStudent.setDateOfBirth(LocalDate.of(1995, 5, 15));
        testStudent.setGender("Male");
        testStudent.setCurrentLivingAddress("123 Main St");
        testStudent.setHomeTownAddress("456 Home St");
        testStudent.setPhoneNumber("0912345678");
        testStudent.setSecondaryPhone("0987654321");
        testStudent.setFatherName("Michael Doe");
        testStudent.setPassportNumber("P12345678");
        testStudent.setNationalID("A123456789");
        testStudent.setUpdatedAt(LocalDate.now());
        testStudent.setStudentId("STU001");
    }

    @Test
    void testShowUpdateForm_Success() {
        when(studentService.findById(studentId)).thenReturn(Optional.of(testStudent));
        when(n5ClassService.getOrCreateN5ClassDTO(studentId)).thenReturn(new N5ClassDTO());
        when(n4ClassService.getOrCreateN4ClassDTO(studentId)).thenReturn(new N4ClassDTO());
        when(interviewNotesService.getOrCreateInterviewNotesDTO(studentId)).thenReturn(new InterviewNotesDTO());

        String viewName = studentController.showUpdateForm(studentId, nameSearch, status, model);

        assertEquals("students/student-update.html", viewName);
        verify(studentService).findById(studentId);
        verify(n5ClassService).getOrCreateN5ClassDTO(studentId);
        verify(n4ClassService).getOrCreateN4ClassDTO(studentId);
        verify(interviewNotesService).getOrCreateInterviewNotesDTO(studentId);
        verify(model).addAttribute(eq("student"), any(Student.class));
        verify(model).addAttribute(eq("n5Class"), any(N5ClassDTO.class));
        verify(model).addAttribute(eq("n4Class"), any(N4ClassDTO.class));
        verify(model).addAttribute(eq("interviewNotes"), any(InterviewNotesDTO.class));
        verify(model).addAttribute("isNew", false);
    }

    @Test
    void testUpdateBasicInfo_Success() {
        BindingResult bindingResult = new BeanPropertyBindingResult(testStudent, "student");
        RedirectAttributes redirectAttributes = new RedirectAttributesModelMap();

        when(studentService.findById(studentId)).thenReturn(Optional.of(testStudent));
        when(studentService.save(any(Student.class))).thenReturn(testStudent);

        String redirectUrl = studentController.updateBasicInfo(
                studentId, testStudent, bindingResult, redirectAttributes, model,
                nameSearch, status, request);

        // Use the actual return value from the controller (with proper encoding)
        assertTrue(redirectUrl.startsWith("redirect:/students/student-update/1?tab=basic"));
        assertTrue(redirectAttributes.getFlashAttributes().containsKey("success"));
        assertEquals("基本情報が正常に更新されました。", redirectAttributes.getFlashAttributes().get("success"));
        verify(studentService).findById(studentId);
        verify(studentService).save(any(Student.class));
    }

    @Test
    void testUpdateBasicInfo_ValidationErrors() {
        BindingResult bindingResult = new BeanPropertyBindingResult(testStudent, "student");
        bindingResult.addError(new ObjectError("studentName", "Student name is required"));
        RedirectAttributes redirectAttributes = new RedirectAttributesModelMap();

        when(studentService.findById(studentId)).thenReturn(Optional.of(testStudent));
        when(n5ClassService.getOrCreateN5ClassDTO(studentId)).thenReturn(new N5ClassDTO());
        when(n4ClassService.getOrCreateN4ClassDTO(studentId)).thenReturn(new N4ClassDTO());
        when(interviewNotesService.getOrCreateInterviewNotesDTO(studentId)).thenReturn(new InterviewNotesDTO());

        String viewName = studentController.updateBasicInfo(
                studentId, testStudent, bindingResult, redirectAttributes, model,
                nameSearch, status, request);

        assertEquals("students/student-update.html", viewName);
        verify(studentService).findById(studentId);
        verify(n5ClassService).getOrCreateN5ClassDTO(studentId);
        verify(n4ClassService).getOrCreateN4ClassDTO(studentId);
        verify(interviewNotesService).getOrCreateInterviewNotesDTO(studentId);
    }

    @Test
    void testUpdateBasicInfo_StudentNotFound() {
        BindingResult bindingResult = new BeanPropertyBindingResult(testStudent, "student");
        RedirectAttributes redirectAttributes = new RedirectAttributesModelMap();

        when(studentService.findById(studentId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> studentController.updateBasicInfo(
                        studentId, testStudent, bindingResult, redirectAttributes, model,
                        nameSearch, status, request));
        assertEquals("Student not found: 1", exception.getMessage());
    }

    @Test
    void testUpdateStatusInfo_Success() {
        testStudent.setStatus("ACTIVE");
        testStudent.setCurrentJapanLevel("N5");
        testStudent.setDesiredJobType("IT");
        BindingResult bindingResult = new BeanPropertyBindingResult(testStudent, "student");
        RedirectAttributes redirectAttributes = new RedirectAttributesModelMap();

        when(studentService.findById(studentId)).thenReturn(Optional.of(testStudent));
        when(studentService.save(any(Student.class))).thenReturn(testStudent);

        String redirectUrl = studentController.updateStatusInfo(
                studentId, testStudent, bindingResult, redirectAttributes, model,
                nameSearch, status);

        assertTrue(redirectUrl.startsWith("redirect:/students/student-update/1?tab=status"));
        assertTrue(redirectAttributes.getFlashAttributes().containsKey("success"));
        assertEquals("ステータス情報が正常に更新されました。", redirectAttributes.getFlashAttributes().get("success"));
        verify(studentService).save(any(Student.class));
    }

    @Test
    void testUpdateStatusInfo_WithException() {
        testStudent.setStatus("ACTIVE");
        BindingResult bindingResult = new BeanPropertyBindingResult(testStudent, "student");
        RedirectAttributes redirectAttributes = new RedirectAttributesModelMap();

        when(studentService.findById(studentId)).thenReturn(Optional.of(testStudent));
        when(studentService.save(any(Student.class))).thenThrow(new RuntimeException("Database error"));

        String redirectUrl = studentController.updateStatusInfo(
                studentId, testStudent, bindingResult, redirectAttributes, model,
                nameSearch, status);

        assertTrue(redirectUrl.startsWith("redirect:/students/student-update/1?tab=status"));
        assertTrue(redirectAttributes.getFlashAttributes().containsKey("error"));
        assertTrue(((String) redirectAttributes.getFlashAttributes().get("error")).contains("Database error"));
    }

    @Test
    void testUpdateN5ClassInfo_Success() {
        N5ClassDTO n5ClassDTO = N5ClassDTO.builder()
                .n5ClassTeacher("Teacher Name")
                .n5ClassAttendance("90%")
                .build();
        RedirectAttributes redirectAttributes = new RedirectAttributesModelMap();

        doNothing().when(n5ClassService).saveN5ClassDTO(studentId, n5ClassDTO);

        String redirectUrl = studentController.updateN5ClassInfo(studentId, n5ClassDTO,
                nameSearch, status, redirectAttributes);

        assertTrue(redirectUrl.startsWith("redirect:/students/student-update/1?tab=n5"));
        assertTrue(redirectAttributes.getFlashAttributes().containsKey("success"));
        assertEquals("N5クラス情報が正常に更新されました。", redirectAttributes.getFlashAttributes().get("success"));
        verify(n5ClassService).saveN5ClassDTO(studentId, n5ClassDTO);
    }

    @Test
    void testUpdateN5ClassInfo_WithException() {
        N5ClassDTO n5ClassDTO = new N5ClassDTO();
        RedirectAttributes redirectAttributes = new RedirectAttributesModelMap();

        doThrow(new RuntimeException("Save failed")).when(n5ClassService).saveN5ClassDTO(studentId, n5ClassDTO);

        String redirectUrl = studentController.updateN5ClassInfo(studentId, n5ClassDTO,
                nameSearch, status, redirectAttributes);

        assertTrue(redirectUrl.startsWith("redirect:/students/student-update/1?tab=n5"));
        assertTrue(redirectAttributes.getFlashAttributes().containsKey("error"));
        assertTrue(((String) redirectAttributes.getFlashAttributes().get("error")).contains("Save failed"));
    }

    @Test
    void testUpdateN4ClassInfo_Success() {
        N4ClassDTO n4ClassDTO = N4ClassDTO.builder().build();
        RedirectAttributes redirectAttributes = new RedirectAttributesModelMap();

        doNothing().when(n4ClassService).saveN4ClassDTO(studentId, n4ClassDTO);

        String redirectUrl = studentController.updateN4ClassInfo(studentId, n4ClassDTO,
                nameSearch, status, redirectAttributes);

        assertTrue(redirectUrl.startsWith("redirect:/students/student-update/1?tab=n4"));
        assertTrue(redirectAttributes.getFlashAttributes().containsKey("success"));
        assertEquals("N4クラス情報が正常に更新されました。", redirectAttributes.getFlashAttributes().get("success"));
        verify(n4ClassService).saveN4ClassDTO(studentId, n4ClassDTO);
    }

    @Test
    void testUpdateInterviewNotes_Success() {
        InterviewNotesDTO interviewNotesDTO = InterviewNotesDTO.builder().build();
        RedirectAttributes redirectAttributes = new RedirectAttributesModelMap();

        doNothing().when(interviewNotesService).saveInterviewNotesDTO(studentId, interviewNotesDTO);

        String redirectUrl = studentController.updateInterviewNotes(studentId, interviewNotesDTO,
                nameSearch, status, redirectAttributes);

        assertTrue(redirectUrl.startsWith("redirect:/students/student-update/1?tab=interview"));
        assertTrue(redirectAttributes.getFlashAttributes().containsKey("success"));
        assertEquals("面談情報が正常に更新されました。", redirectAttributes.getFlashAttributes().get("success"));
        verify(interviewNotesService).saveInterviewNotesDTO(studentId, interviewNotesDTO);
    }

    @Test
    void testUpdateBasicInfo_AllFieldsUpdated() {
        Student updatedStudent = new Student();
        updatedStudent.setStudentName("Updated Name");
        updatedStudent.setNameInJapanese("アップデート名");
        updatedStudent.setDateOfBirth(LocalDate.of(1996, 6, 16));
        updatedStudent.setGender("Female");
        updatedStudent.setCurrentLivingAddress("789 Updated St");
        updatedStudent.setHomeTownAddress("101 Home St");
        updatedStudent.setPhoneNumber("0999999999");
        updatedStudent.setSecondaryPhone("0888888888");
        updatedStudent.setFatherName("Updated Father");
        updatedStudent.setPassportNumber("P99999999");
        updatedStudent.setNationalID("A999999999");
        updatedStudent.setContactViber("updated_viber");

        BindingResult bindingResult = new BeanPropertyBindingResult(updatedStudent, "student");
        RedirectAttributes redirectAttributes = new RedirectAttributesModelMap();

        when(studentService.findById(studentId)).thenReturn(Optional.of(testStudent));
        when(studentService.save(any(Student.class))).thenReturn(testStudent);

        String redirectUrl = studentController.updateBasicInfo(
                studentId, updatedStudent, bindingResult, redirectAttributes, model,
                nameSearch, status, request);

        assertTrue(redirectUrl.startsWith("redirect:/students/student-update/1?tab=basic"));
        verify(studentService).save(argThat(student -> student.getStudentName().equals("Updated Name") &&
                student.getNameInJapanese().equals("アップデート名") &&
                student.getDateOfBirth().equals(LocalDate.of(1996, 6, 16)) &&
                student.getGender().equals("Female") &&
                student.getCurrentLivingAddress().equals("789 Updated St") &&
                student.getHomeTownAddress().equals("101 Home St") &&
                student.getPhoneNumber().equals("0999999999") &&
                student.getSecondaryPhone().equals("0888888888") &&
                student.getFatherName().equals("Updated Father") &&
                student.getPassportNumber().equals("P99999999") &&
                student.getNationalID().equals("A999999999") &&
                student.getContactViber().equals("updated_viber")));
    }

}