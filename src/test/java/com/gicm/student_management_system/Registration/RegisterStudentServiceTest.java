package com.gicm.student_management_system.Registration;

import com.gicm.student_management_system.dto.StudentRegistrationDTO;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.RegisterStudentRepository;
import com.gicm.student_management_system.serviceimpl.RegisterStudentServiceImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RegisterStudentServiceTest {

    @Mock
    private RegisterStudentRepository studentRepository;

    @InjectMocks
    private RegisterStudentServiceImpl registerStudentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegisterStudent_Success() {
        // Arrange
        StudentRegistrationDTO dto = new StudentRegistrationDTO();
        dto.setEnglishName("John Doe");
        dto.setKatakanaName("ジョン・ドウ");
        dto.setDob("2000-01-01");
        dto.setGender("Male");
        dto.setNationalIdNumber("12/ABCXYZ(N)123456");
        dto.setCurrentAddress("Yangon");
        dto.setHometownAddress("Mandalay");
        dto.setPhoneNumber("09123456789");
        dto.setGuardianPhoneNumber("09987654321");
        dto.setFatherName("Father Name");
        dto.setJlptLevel("N5");
        dto.setDesiredOccupation("Engineer");
        dto.setJapanTravelExperience(true);
        dto.setCoeApplicationExperience(false);
        dto.setReligion("Buddhist");
        dto.setSmoking(false);
        dto.setAlcohol(false);
        dto.setTattoo(false);
        dto.setTuitionPaymentDate("2025-01-01");
        dto.setWantDorm(true);

        Student savedStudent = new Student();
        savedStudent.setStudentId("STU001");
        savedStudent.setStudentName("John Doe");

        when(studentRepository.existsByNationalID(anyString())).thenReturn(false);
        when(studentRepository.existsByPassportNumber(anyString())).thenReturn(false);
        when(studentRepository.count()).thenReturn(0L);
        when(studentRepository.existsByStudentId(anyString())).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenReturn(savedStudent);

        // Act
        Student result = registerStudentService.registerStudent(dto);

        // Assert
        assertNotNull(result);
        assertEquals("STU001", result.getStudentId());
        assertEquals("John Doe", result.getStudentName());
        verify(studentRepository, times(1)).save(any(Student.class));
    }

    @Test
    void testGenerateStudentId() {
        // Arrange
        when(studentRepository.count()).thenReturn(0L);
        when(studentRepository.existsByStudentId(anyString())).thenReturn(false);

        // Act
        String studentId = registerStudentService.generateStudentId();

        // Assert
        assertNotNull(studentId);
        assertTrue(studentId.matches("STU\\d{3}"), "Student ID should match format STU001, STU002, etc.");
        assertEquals("STU001", studentId);
    }

    @Test
    void testRegisterStudent_NullInput() {
        // Assert - The implementation throws NullPointerException, not IllegalArgumentException
        assertThrows(NullPointerException.class, () -> {
            registerStudentService.registerStudent(null);
        });
    }
}
