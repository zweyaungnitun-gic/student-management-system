package com.gicm.student_management_system;

import com.gicm.student_management_system.dto.N4ClassDTO;
import com.gicm.student_management_system.entity.N4Class;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.N4ClassRepository;
import com.gicm.student_management_system.repository.StudentRepository;
import com.gicm.student_management_system.serviceimpl.N4ClassServiceImpl;

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
class N4ClassServiceImplTest_Update {

        @Mock
        private N4ClassRepository n4ClassRepository;

        @Mock
        private StudentRepository studentRepository;

        @InjectMocks
        private N4ClassServiceImpl n4ClassService;

        private Student testStudent;
        private N4Class testN4Class;
        private Long studentId = 2L;

        @BeforeEach
        void setUp() {
                testStudent = new Student();
                testStudent.setId(studentId);
                testStudent.setStudentName("Jane Smith");

                testN4Class = N4Class.builder()
                                .id(1L)
                                .student(testStudent)
                                .n4ClassTeacher("N4 Teacher A")
                                .n4ClassAttendance("92%")
                                .n4ClassTestResult1("Excellent")
                                .n4ClassTestResult2("Good")
                                .n4ClassTestResult3("Average")
                                .n4ClassTestResult4("Poor")
                                .n4ClassFeedback("Good progress in N4")
                                .n4Class1Teacher("N4 Teacher B")
                                .n4Class1AttendanceRate("88%")
                                .n4Class1TestResult("90%")
                                .n4Class1TeacherFeedback("Excellent speaking skills")
                                .n4Class2Teacher("N4 Teacher C")
                                .n4Class2AttendanceRate("95%")
                                .n4Class2TestResult("85%")
                                .n4Class2TeacherFeedback("Good listening comprehension")
                                .n4Class3Teacher("N4 Teacher D")
                                .n4Class3AttendanceRate("82%")
                                .n4Class3TestResult("78%")
                                .n4Class3TeacherFeedback("Needs more vocabulary practice")
                                .build();
        }

        @Test
        void testGetOrCreateN4ClassDTO_ExistingRecord() {
                when(n4ClassRepository.findByStudentId(studentId)).thenReturn(Optional.of(testN4Class));

                N4ClassDTO result = n4ClassService.getOrCreateN4ClassDTO(studentId);

                assertNotNull(result);
                assertEquals(studentId, result.getStudentId());
                assertEquals("N4 Teacher A", result.getN4ClassTeacher());
                assertEquals("92%", result.getN4ClassAttendance());
                assertEquals("Excellent", result.getN4ClassTestResult1());
                assertEquals("Good", result.getN4ClassTestResult2());
                assertEquals("Average", result.getN4ClassTestResult3());
                assertEquals("Poor", result.getN4ClassTestResult4());
                assertEquals("Good progress in N4", result.getN4ClassFeedback());
                assertEquals("N4 Teacher B", result.getN4Class1Teacher());
                assertEquals("88%", result.getN4Class1AttendanceRate());
                assertEquals("90%", result.getN4Class1TestResult());
                assertEquals("Excellent speaking skills", result.getN4Class1TeacherFeedback());
                assertEquals("N4 Teacher C", result.getN4Class2Teacher());
                assertEquals("95%", result.getN4Class2AttendanceRate());
                assertEquals("85%", result.getN4Class2TestResult());
                assertEquals("Good listening comprehension", result.getN4Class2TeacherFeedback());
                assertEquals("N4 Teacher D", result.getN4Class3Teacher());
                assertEquals("82%", result.getN4Class3AttendanceRate());
                assertEquals("78%", result.getN4Class3TestResult());
                assertEquals("Needs more vocabulary practice", result.getN4Class3TeacherFeedback());

                verify(n4ClassRepository).findByStudentId(studentId);
                verify(studentRepository, never()).findById(anyLong());
        }

        @Test
        void testGetOrCreateN4ClassDTO_NewRecord() {
                when(n4ClassRepository.findByStudentId(studentId)).thenReturn(Optional.empty());

                N4ClassDTO result = n4ClassService.getOrCreateN4ClassDTO(studentId);

                assertNotNull(result);
                assertEquals(studentId, result.getStudentId());
                assertNull(result.getN4ClassTeacher());
                assertNull(result.getN4ClassAttendance());
                assertNull(result.getN4ClassTestResult1());
                assertNull(result.getN4ClassTestResult2());
                assertNull(result.getN4ClassTestResult3());
                assertNull(result.getN4ClassTestResult4());
                assertNull(result.getN4ClassFeedback());
                assertNull(result.getN4Class1Teacher());
                assertNull(result.getN4Class1AttendanceRate());
                assertNull(result.getN4Class1TestResult());
                assertNull(result.getN4Class1TeacherFeedback());
                assertNull(result.getN4Class2Teacher());
                assertNull(result.getN4Class2AttendanceRate());
                assertNull(result.getN4Class2TestResult());
                assertNull(result.getN4Class2TeacherFeedback());
                assertNull(result.getN4Class3Teacher());
                assertNull(result.getN4Class3AttendanceRate());
                assertNull(result.getN4Class3TestResult());
                assertNull(result.getN4Class3TeacherFeedback());

                verify(n4ClassRepository).findByStudentId(studentId);
                verify(studentRepository, never()).findById(anyLong());
        }

        @Test
        void testSaveN4ClassDTO_UpdateExisting() {
                N4ClassDTO dto = N4ClassDTO.builder()
                                .n4ClassTeacher("Updated N4 Teacher")
                                .n4ClassAttendance("96%")
                                .n4ClassTestResult1("Outstanding")
                                .n4ClassTestResult2("Very Good")
                                .n4ClassTestResult3("Satisfactory")
                                .n4ClassTestResult4("Needs Work")
                                .n4ClassFeedback("Significant improvement shown")
                                .n4Class1Teacher("Updated Teacher 1")
                                .n4Class1AttendanceRate("91%")
                                .n4Class1TestResult("92%")
                                .n4Class1TeacherFeedback("Excellent progress in conversation")
                                .n4Class2Teacher("Updated Teacher 2")
                                .n4Class2AttendanceRate("97%")
                                .n4Class2TestResult("89%")
                                .n4Class2TeacherFeedback("Great reading comprehension")
                                .n4Class3Teacher("Updated Teacher 3")
                                .n4Class3AttendanceRate("84%")
                                .n4Class3TestResult("81%")
                                .n4Class3TeacherFeedback("Improved writing skills")
                                .build();

                when(studentRepository.findById(studentId)).thenReturn(Optional.of(testStudent));
                when(n4ClassRepository.findByStudentId(studentId)).thenReturn(Optional.of(testN4Class));
                when(n4ClassRepository.save(any(N4Class.class))).thenReturn(testN4Class);

                n4ClassService.saveN4ClassDTO(studentId, dto);

                verify(studentRepository).findById(studentId);
                verify(n4ClassRepository).findByStudentId(studentId);
                verify(n4ClassRepository)
                                .save(argThat(n4Class -> n4Class.getN4ClassTeacher().equals("Updated N4 Teacher") &&
                                                n4Class.getN4ClassAttendance().equals("96%") &&
                                                n4Class.getN4ClassTestResult1().equals("Outstanding") &&
                                                n4Class.getN4ClassTestResult2().equals("Very Good") &&
                                                n4Class.getN4ClassTestResult3().equals("Satisfactory") &&
                                                n4Class.getN4ClassTestResult4().equals("Needs Work") &&
                                                n4Class.getN4ClassFeedback().equals("Significant improvement shown") &&
                                                n4Class.getN4Class1Teacher().equals("Updated Teacher 1") &&
                                                n4Class.getN4Class1AttendanceRate().equals("91%") &&
                                                n4Class.getN4Class1TestResult().equals("92%") &&
                                                n4Class.getN4Class1TeacherFeedback()
                                                                .equals("Excellent progress in conversation")
                                                &&
                                                n4Class.getN4Class2Teacher().equals("Updated Teacher 2") &&
                                                n4Class.getN4Class2AttendanceRate().equals("97%") &&
                                                n4Class.getN4Class2TestResult().equals("89%") &&
                                                n4Class.getN4Class2TeacherFeedback()
                                                                .equals("Great reading comprehension")
                                                &&
                                                n4Class.getN4Class3Teacher().equals("Updated Teacher 3") &&
                                                n4Class.getN4Class3AttendanceRate().equals("84%") &&
                                                n4Class.getN4Class3TestResult().equals("81%") &&
                                                n4Class.getN4Class3TeacherFeedback().equals("Improved writing skills")
                                                &&
                                                n4Class.getStudent().equals(testStudent)));
        }

        @Test
        void testSaveN4ClassDTO_CreateNew() {
                N4ClassDTO dto = N4ClassDTO.builder()
                                .n4ClassTeacher("New N4 Teacher")
                                .n4ClassAttendance("100%")
                                .n4Class1Teacher("New Conversation Teacher")
                                .n4Class1TestResult("95%")
                                .build();

                when(studentRepository.findById(studentId)).thenReturn(Optional.of(testStudent));
                when(n4ClassRepository.findByStudentId(studentId)).thenReturn(Optional.empty());
                when(n4ClassRepository.save(any(N4Class.class))).thenAnswer(invocation -> invocation.getArgument(0));

                n4ClassService.saveN4ClassDTO(studentId, dto);

                verify(studentRepository).findById(studentId);
                verify(n4ClassRepository).findByStudentId(studentId);
                verify(n4ClassRepository)
                                .save(argThat(n4Class -> n4Class.getN4ClassTeacher().equals("New N4 Teacher") &&
                                                n4Class.getN4ClassAttendance().equals("100%") &&
                                                n4Class.getN4Class1Teacher().equals("New Conversation Teacher") &&
                                                n4Class.getN4Class1TestResult().equals("95%") &&
                                                n4Class.getStudent().equals(testStudent)));
        }

        @Test
        void testSaveN4ClassDTO_StudentNotFound() {
                N4ClassDTO dto = new N4ClassDTO();
                when(studentRepository.findById(studentId)).thenReturn(Optional.empty());

                RuntimeException exception = assertThrows(RuntimeException.class,
                                () -> n4ClassService.saveN4ClassDTO(studentId, dto));
                assertEquals("Student not found: " + studentId, exception.getMessage());

                verify(studentRepository).findById(studentId);
                verify(n4ClassRepository, never()).findByStudentId(anyLong());
                verify(n4ClassRepository, never()).save(any());
        }

        @Test
        void getOrCreateN4ClassDTO_whenEntityNull_returnsEmptyDTO() {
                Mockito.when(n4ClassRepository.findByStudentId(studentId))
                                .thenReturn(Optional.empty());

                N4ClassDTO dto = n4ClassService.getOrCreateN4ClassDTO(studentId);

                assertNotNull(dto);
                assertEquals(studentId, dto.getStudentId());
                assertNull(dto.getN4ClassTeacher());
        }
}