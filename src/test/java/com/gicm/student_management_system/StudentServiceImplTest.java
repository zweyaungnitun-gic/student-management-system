package com.gicm.student_management_system;

import com.gicm.student_management_system.dto.StudentDTO;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.StudentRepository;
import com.gicm.student_management_system.serviceimpl.StudentServiceImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceImplTest {

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentServiceImpl studentService;

    private Student testStudent;
    private Long studentId = 1L;

    @BeforeEach
    void setUp() {
        testStudent = new Student();
        testStudent.setId(studentId);
        testStudent.setStudentId("STU001");
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
        testStudent.setCurrentJapanLevel("N5");
        testStudent.setDesiredJobType("IT");
        testStudent.setStatus("ACTIVE");
        testStudent.setEnrolledDate(LocalDate.now());
        testStudent.setSchedulePaymentTutionDate(LocalDate.now().plusDays(30));
        testStudent.setActualTutionPaymentDate(LocalDate.now());
        testStudent.setCreatedAt(LocalDate.now());
        testStudent.setUpdatedAt(LocalDate.now());
        testStudent.setContactViber("john_viber");

        StudentDTO.builder()
                .id(studentId)
                .studentId("STU001")
                .studentName("John Doe")
                .nameInJapanese("ジョン・ドウ")
                .dateOfBirth(LocalDate.of(1995, 5, 15))
                .gender("Male")
                .currentLivingAddress("123 Main St")
                .homeTownAddress("456 Home St")
                .phoneNumber("0912345678")
                .secondaryPhone("0987654321")
                .fatherName("Michael Doe")
                .passportNumber("P12345678")
                .nationalID("A123456789")
                .currentJapanLevel("N5")
                .desiredJobType("IT")
                .status("ACTIVE")
                .enrolledDate(LocalDate.now())
                .paymentDueDate(LocalDate.now().plusDays(30))
                .paymentDate(LocalDate.now())
                .contactViber("john_viber")
                .build();
    }

    @Test
    void testGetStudentById_Success() {
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(testStudent));

        StudentDTO result = studentService.getStudentById(studentId);

        assertNotNull(result);
        assertEquals("STU001", result.getStudentId());
        assertEquals("John Doe", result.getStudentName());
        assertEquals("ジョン・ドウ", result.getNameInJapanese());
        assertEquals("0912345678", result.getPhoneNumber());
        assertEquals("john_viber", result.getContactViber());
        assertEquals("ACTIVE", result.getStatus());
        verify(studentRepository).findById(studentId);
    }

    @Test
    void testUpdateStudent_Success() {
        StudentDTO updatedDTO = StudentDTO.builder()
                .studentName("Updated Name")
                .gender("Female")
                .phoneNumber("0999999999")
                .desiredJobType("Engineering")
                .status("INACTIVE")
                .paymentDueDate(LocalDate.now().plusDays(60))
                .paymentDate(LocalDate.now().plusDays(1))
                .build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(testStudent));
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StudentDTO result = studentService.updateStudent(studentId, updatedDTO);

        assertNotNull(result);
        verify(studentRepository).findById(studentId);
        verify(studentRepository).save(argThat(student -> student.getStudentName().equals("Updated Name") &&
                student.getGender().equals("Female") &&
                student.getPhoneNumber().equals("0999999999") &&
                student.getDesiredJobType().equals("Engineering") &&
                student.getStatus().equals("INACTIVE") &&
                student.getSchedulePaymentTutionDate().equals(LocalDate.now().plusDays(60)) &&
                student.getActualTutionPaymentDate().equals(LocalDate.now().plusDays(1))));
    }

    @Test
    void testConvertToDTO_AllFields() {
        StudentDTO result = studentService.convertToDTO(testStudent);

        assertNotNull(result);
        assertEquals("STU001", result.getStudentId());
        assertEquals("John Doe", result.getStudentName());
        assertEquals("ジョン・ドウ", result.getNameInJapanese());
        assertEquals(LocalDate.of(1995, 5, 15), result.getDateOfBirth());
        assertEquals("Male", result.getGender());
        assertEquals("123 Main St", result.getCurrentLivingAddress());
        assertEquals("456 Home St", result.getHomeTownAddress());
        assertEquals("0912345678", result.getPhoneNumber());
        assertEquals("0987654321", result.getSecondaryPhone());
        assertEquals("Michael Doe", result.getFatherName());
        assertEquals("P12345678", result.getPassportNumber());
        assertEquals("A123456789", result.getNationalID());
        assertEquals("N5", result.getCurrentJapanLevel());
        assertEquals("IT", result.getDesiredJobType());
        assertEquals("ACTIVE", result.getStatus());
        assertEquals("john_viber", result.getContactViber());
        assertEquals(testStudent.getSchedulePaymentTutionDate(), result.getPaymentDueDate());
        assertEquals(testStudent.getActualTutionPaymentDate(), result.getPaymentDate());
    }

    @Test
    void testConvertToDTO_WithNullValues() {
        Student studentWithNulls = new Student();
        studentWithNulls.setId(studentId);
        studentWithNulls.setStudentName("Test");
        studentWithNulls.setStudentId("TEST001");
        studentWithNulls.setGender("Male");
        studentWithNulls.setPhoneNumber("0912345678");
        studentWithNulls.setDesiredJobType("IT");
        studentWithNulls.setStatus("ACTIVE");

        StudentDTO result = studentService.convertToDTO(studentWithNulls);

        assertNotNull(result);
        assertEquals("Test", result.getStudentName());
        assertEquals("TEST001", result.getStudentId());
        assertEquals("Male", result.getGender());
        assertEquals("0912345678", result.getPhoneNumber());
        assertEquals("IT", result.getDesiredJobType());
        assertEquals("ACTIVE", result.getStatus());
        assertNull(result.getDateOfBirth());
        assertNull(result.getNameInJapanese());
        assertNull(result.getCurrentLivingAddress());
        assertNull(result.getHomeTownAddress());
        assertNull(result.getSecondaryPhone());
        assertNull(result.getFatherName());
        assertNull(result.getPassportNumber());
        assertNull(result.getNationalID());
        assertNull(result.getCurrentJapanLevel());
        assertNull(result.getContactViber());
        assertNull(result.getPaymentDueDate());
        assertNull(result.getPaymentDate());
    }
}