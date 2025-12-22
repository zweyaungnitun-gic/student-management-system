package com.gicm.student_management_system;

import com.gicm.student_management_system.dto.StudentDTO;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.StudentRepository;
import com.gicm.student_management_system.serviceimpl.StudentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.time.LocalDate;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class StudentServiceImplTest_Detail {
    @Mock
    private StudentRepository studentRepository;
    @InjectMocks
    private StudentServiceImpl studentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetStudentById() {
        Student student = new Student();
        student.setId(1L);
        student.setStudentId("STU001");
        student.setStudentName("Aung Ko Min");
        student.setNameInJapanese("アウン コ ミン");
        student.setDateOfBirth(LocalDate.of(2003, 4, 15));
        student.setGender("Male");
        student.setReligion("buddhism");
        student.setDesiredJobType("kaigo");
        student.setNationalID("12/MaKaNa(N)123456");
        student.setIsSmoking(false);
        student.setIsAlcoholDrink(false);
        student.setHaveTatto(false);
        student.setStatus("ACTIVE");
        // Mock the repository behavior
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        // 2. Act: Call the service method
        StudentDTO response = studentService.getStudentById(1L);

        // 3. Assert: Verify the DTO contains the correct data for the View
        assertNotNull(response);
        assertEquals("STU001", response.getStudentId());
        assertEquals("Aung Ko Min", response.getStudentName());
        assertEquals("アウン コ ミン", response.getNameInJapanese());
        assertEquals("kaigo", response.getDesiredJobType());
        // Verify Boolean to String/Value mapping logic implicit in the DTO
        assertFalse(response.getIsSmoking());
        assertFalse(response.getHaveTatto());
        // Verify the interaction with the repository
        verify(studentRepository, times(1)).findById(1L);
    }

    @Test
    void testGetStudentById_NotFound() {
        // Test case for when the ID does not exist
        when(studentRepository.findById(99L)).thenReturn(Optional.empty());
        StudentDTO response = studentService.getStudentById(99L);

        assertNull(response);
        verify(studentRepository, times(1)).findById(99L);
    }
}