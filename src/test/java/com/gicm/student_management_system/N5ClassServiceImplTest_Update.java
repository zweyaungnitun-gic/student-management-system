package com.gicm.student_management_system;

import com.gicm.student_management_system.dto.N5ClassDTO;
import com.gicm.student_management_system.entity.N5Class;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.N5ClassRepository;
import com.gicm.student_management_system.repository.StudentRepository;
import com.gicm.student_management_system.serviceimpl.N5ClassServiceImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class N5ClassServiceImplTest_Update {

    @Mock
    public N5ClassRepository n5ClassRepository;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private N5ClassServiceImpl n5ClassService;

    private Student testStudent;
    private N5Class testN5Class;
    private Long studentId = 1L;

    @BeforeEach
    void setUp() {
        testStudent = new Student();
        testStudent.setId(studentId);
        testStudent.setStudentName("John Doe");

        testN5Class = N5Class.builder()
                .id(1L)
                .student(testStudent)
                .n5ClassTeacher("Teacher A")
                .n5ClassAttendance("95%")
                .n5ClassTestResult1("Pass")
                .n5ClassTestResult2("Fail")
                .n5ClassTestResult3("Pass")
                .n5ClassTestResult4("Pass")
                .n5ClassFeedback("Good progress")
                .n5Class1Teacher("Teacher B")
                .n5Class1AttendanceRate("90%")
                .n5Class1TestResult("85%")
                .n5Class1TeacherFeedback("Needs improvement")
                .n5Class2Teacher("Teacher C")
                .n5Class2AttendanceRate("100%")
                .n5Class2TestResult("92%")
                .n5Class2TeacherFeedback("Excellent work")
                .n5Class3Teacher("Teacher D")
                .n5Class3AttendanceRate("88%")
                .n5Class3TestResult("78%")
                .n5Class3TeacherFeedback("Average performance")
                .build();
    }

    @Test
    void testGetOrCreateN5ClassDTO_ExistingRecord() {
        when(n5ClassRepository.findByStudentId(studentId)).thenReturn(Optional.of(testN5Class));

        N5ClassDTO result = n5ClassService.getOrCreateN5ClassDTO(studentId);
        assertNotNull(result);
        assertEquals(studentId, result.getStudentId());
        assertEquals("Teacher A", result.getN5ClassTeacher());
        assertEquals("95%", result.getN5ClassAttendance());
        assertEquals("Pass", result.getN5ClassTestResult1());
        assertEquals("Fail", result.getN5ClassTestResult2());
        assertEquals("Pass", result.getN5ClassTestResult3());
        assertEquals("Pass", result.getN5ClassTestResult4());
        assertEquals("Good progress", result.getN5ClassFeedback());
        assertEquals("Teacher B", result.getN5Class1Teacher());
        assertEquals("90%", result.getN5Class1AttendanceRate());
        assertEquals("85%", result.getN5Class1TestResult());
        assertEquals("Needs improvement", result.getN5Class1TeacherFeedback());
        assertEquals("Teacher C", result.getN5Class2Teacher());
        assertEquals("100%", result.getN5Class2AttendanceRate());
        assertEquals("92%", result.getN5Class2TestResult());
        assertEquals("Excellent work", result.getN5Class2TeacherFeedback());
        assertEquals("Teacher D", result.getN5Class3Teacher());
        assertEquals("88%", result.getN5Class3AttendanceRate());
        assertEquals("78%", result.getN5Class3TestResult());
        assertEquals("Average performance", result.getN5Class3TeacherFeedback());

        verify(n5ClassRepository).findByStudentId(studentId);
        verify(studentRepository, never()).findById(anyLong());
    }

    @Test
    void testGetOrCreateN5ClassDTO_NewRecord() {
        when(n5ClassRepository.findByStudentId(studentId)).thenReturn(Optional.empty());

        N5ClassDTO result = n5ClassService.getOrCreateN5ClassDTO(studentId);

        assertNotNull(result);
        assertEquals(studentId, result.getStudentId());
        assertNull(result.getN5ClassTeacher());
        assertNull(result.getN5ClassAttendance());
        assertNull(result.getN5ClassTestResult1());
        assertNull(result.getN5ClassTestResult2());
        assertNull(result.getN5ClassTestResult3());
        assertNull(result.getN5ClassTestResult4());
        assertNull(result.getN5ClassFeedback());

        verify(n5ClassRepository).findByStudentId(studentId);
        verify(studentRepository, never()).findById(anyLong());
    }

    @Test
    void testSaveN5ClassDTO_UpdateExisting() {
        N5ClassDTO dto = N5ClassDTO.builder()
                .n5ClassTeacher("Updated Teacher")
                .n5ClassAttendance("98%")
                .n5ClassTestResult1("Excellent")
                .n5ClassTestResult2("Good")
                .n5ClassTestResult3("Average")
                .n5ClassTestResult4("Poor")
                .n5ClassFeedback("Updated feedback")
                .n5Class1Teacher("New Teacher 1")
                .n5Class1AttendanceRate("95%")
                .n5Class1TestResult("88%")
                .n5Class1TeacherFeedback("Updated feedback 1")
                .n5Class2Teacher("New Teacher 2")
                .n5Class2AttendanceRate("99%")
                .n5Class2TestResult("94%")
                .n5Class2TeacherFeedback("Updated feedback 2")
                .n5Class3Teacher("New Teacher 3")
                .n5Class3AttendanceRate("85%")
                .n5Class3TestResult("76%")
                .n5Class3TeacherFeedback("Updated feedback 3")
                .build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(testStudent));
        when(n5ClassRepository.findByStudentId(studentId)).thenReturn(Optional.of(testN5Class));
        when(n5ClassRepository.save(any(N5Class.class))).thenReturn(testN5Class);

        n5ClassService.saveN5ClassDTO(studentId, dto);

        verify(studentRepository).findById(studentId);
        verify(n5ClassRepository).findByStudentId(studentId);
        verify(n5ClassRepository).save(argThat(n5Class -> n5Class.getN5ClassTeacher().equals("Updated Teacher") &&
                n5Class.getN5ClassAttendance().equals("98%") &&
                n5Class.getN5ClassTestResult1().equals("Excellent") &&
                n5Class.getN5ClassTestResult2().equals("Good") &&
                n5Class.getN5ClassTestResult3().equals("Average") &&
                n5Class.getN5ClassTestResult4().equals("Poor") &&
                n5Class.getN5ClassFeedback().equals("Updated feedback") &&
                n5Class.getN5Class1Teacher().equals("New Teacher 1") &&
                n5Class.getN5Class1AttendanceRate().equals("95%") &&
                n5Class.getN5Class1TestResult().equals("88%") &&
                n5Class.getN5Class1TeacherFeedback().equals("Updated feedback 1") &&
                n5Class.getN5Class2Teacher().equals("New Teacher 2") &&
                n5Class.getN5Class2AttendanceRate().equals("99%") &&
                n5Class.getN5Class2TestResult().equals("94%") &&
                n5Class.getN5Class2TeacherFeedback().equals("Updated feedback 2") &&
                n5Class.getN5Class3Teacher().equals("New Teacher 3") &&
                n5Class.getN5Class3AttendanceRate().equals("85%") &&
                n5Class.getN5Class3TestResult().equals("76%") &&
                n5Class.getN5Class3TeacherFeedback().equals("Updated feedback 3") &&
                n5Class.getStudent().equals(testStudent)));
    }

    @Test
    void testSaveN5ClassDTO_CreateNew() {
        N5ClassDTO dto = N5ClassDTO.builder()
                .n5ClassTeacher("New Teacher")
                .n5ClassAttendance("100%")
                .build();

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(testStudent));
        when(n5ClassRepository.findByStudentId(studentId)).thenReturn(Optional.empty());
        when(n5ClassRepository.save(any(N5Class.class))).thenAnswer(invocation -> invocation.getArgument(0));

        n5ClassService.saveN5ClassDTO(studentId, dto);

        verify(studentRepository).findById(studentId);
        verify(n5ClassRepository).findByStudentId(studentId);
        verify(n5ClassRepository).save(argThat(n5Class -> n5Class.getN5ClassTeacher().equals("New Teacher") &&
                n5Class.getN5ClassAttendance().equals("100%") &&
                n5Class.getStudent().equals(testStudent)));
    }

    @Test
    void testSaveN5ClassDTO_StudentNotFound() {
        N5ClassDTO dto = new N5ClassDTO();
        when(studentRepository.findById(studentId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> n5ClassService.saveN5ClassDTO(studentId, dto));
        assertEquals("Student not found: 1", exception.getMessage());

        verify(studentRepository).findById(studentId);
        verify(n5ClassRepository, never()).findByStudentId(anyLong());
        verify(n5ClassRepository, never()).save(any());
    }

    @Test
    void getOrCreateN5ClassDTO_whenEntityNull_returnsEmptyDTO() {
        Mockito.when(n5ClassRepository.findByStudentId(1L))
                .thenReturn(Optional.empty());

        N5ClassDTO dto = n5ClassService.getOrCreateN5ClassDTO(1L);

        assertNotNull(dto);
    }
}