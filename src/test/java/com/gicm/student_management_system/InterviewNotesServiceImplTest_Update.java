package com.gicm.student_management_system;

import com.gicm.student_management_system.dto.InterviewNotesDTO;
import com.gicm.student_management_system.entity.InterviewNotes;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.InterviewNotesRepository;
import com.gicm.student_management_system.repository.StudentRepository;
import com.gicm.student_management_system.serviceimpl.InterviewNotesServiceImpl;

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
class InterviewNotesServiceImplTest_Update {

        @Mock
        private InterviewNotesRepository interviewNotesRepository;

        @Mock
        private StudentRepository studentRepository;

        @InjectMocks
        private InterviewNotesServiceImpl interviewNotesService;

        private Student testStudent;
        private InterviewNotes testInterviewNotes;
        private Long studentId = 3L;

        @BeforeEach
        void setUp() {
                testStudent = new Student();
                testStudent.setId(studentId);
                testStudent.setStudentName("Bob Johnson");

                testInterviewNotes = InterviewNotes.builder()
                                .id(1L)
                                .student(testStudent)
                                .interview1("First interview conducted on 2024-01-15. Student shows good motivation.")
                                .interview2("Second interview on 2024-02-20. Discussed career goals in Japan.")
                                .interview3("Final interview on 2024-03-25. Student passed all requirements.")
                                .otherMemo("Student needs additional support with technical vocabulary.")
                                .build();
        }

        @Test
        void testGetOrCreateInterviewNotesDTO_ExistingRecord() {
                when(interviewNotesRepository.findByStudentId(studentId)).thenReturn(Optional.of(testInterviewNotes));

                InterviewNotesDTO result = interviewNotesService.getOrCreateInterviewNotesDTO(studentId);

                assertNotNull(result);
                assertEquals(studentId, result.getStudentId());
                assertEquals("First interview conducted on 2024-01-15. Student shows good motivation.",
                                result.getInterview1());
                assertEquals("Second interview on 2024-02-20. Discussed career goals in Japan.",
                                result.getInterview2());
                assertEquals("Final interview on 2024-03-25. Student passed all requirements.",
                                result.getInterview3());
                assertEquals("Student needs additional support with technical vocabulary.",
                                result.getOtherMemo());

                verify(interviewNotesRepository).findByStudentId(studentId);
                verify(studentRepository, never()).findById(anyLong());
        }

        @Test
        void testGetOrCreateInterviewNotesDTO_NewRecord() {
                when(interviewNotesRepository.findByStudentId(studentId)).thenReturn(Optional.empty());

                InterviewNotesDTO result = interviewNotesService.getOrCreateInterviewNotesDTO(studentId);

                assertNotNull(result);
                assertEquals(studentId, result.getStudentId());
                assertNull(result.getInterview1());
                assertNull(result.getInterview2());
                assertNull(result.getInterview3());
                assertNull(result.getOtherMemo());

                verify(interviewNotesRepository).findByStudentId(studentId);
                verify(studentRepository, never()).findById(anyLong());
        }

        @Test
        void testSaveInterviewNotesDTO_UpdateExisting() {
                InterviewNotesDTO dto = InterviewNotesDTO.builder()
                                .interview1("Updated first interview notes. Added new observations.")
                                .interview2("Updated second interview with focus on language proficiency.")
                                .interview3("Updated third interview - final assessment completed.")
                                .otherMemo("Updated memo: Student has shown remarkable improvement.")
                                .build();

                when(studentRepository.findById(studentId)).thenReturn(Optional.of(testStudent));
                when(interviewNotesRepository.findByStudentId(studentId)).thenReturn(Optional.of(testInterviewNotes));
                when(interviewNotesRepository.save(any(InterviewNotes.class))).thenReturn(testInterviewNotes);

                interviewNotesService.saveInterviewNotesDTO(studentId, dto);

                verify(studentRepository).findById(studentId);
                verify(interviewNotesRepository).findByStudentId(studentId);
                verify(interviewNotesRepository).save(argThat(interviewNotes -> interviewNotes.getInterview1()
                                .equals("Updated first interview notes. Added new observations.") &&
                                interviewNotes.getInterview2()
                                                .equals("Updated second interview with focus on language proficiency.")
                                &&
                                interviewNotes.getInterview3()
                                                .equals("Updated third interview - final assessment completed.")
                                &&
                                interviewNotes.getOtherMemo()
                                                .equals("Updated memo: Student has shown remarkable improvement.")
                                &&
                                interviewNotes.getStudent().equals(testStudent)));
        }

        @Test
        void testSaveInterviewNotesDTO_CreateNew() {
                InterviewNotesDTO dto = InterviewNotesDTO.builder()
                                .interview1("Initial screening interview completed.")
                                .interview2("Technical assessment conducted.")
                                .otherMemo("Pending final review.")
                                .build();

                when(studentRepository.findById(studentId)).thenReturn(Optional.of(testStudent));
                when(interviewNotesRepository.findByStudentId(studentId)).thenReturn(Optional.empty());
                when(interviewNotesRepository.save(any(InterviewNotes.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                interviewNotesService.saveInterviewNotesDTO(studentId, dto);

                verify(studentRepository).findById(studentId);
                verify(interviewNotesRepository).findByStudentId(studentId);
                verify(interviewNotesRepository).save(argThat(
                                interviewNotes -> interviewNotes.getInterview1()
                                                .equals("Initial screening interview completed.") &&
                                                interviewNotes.getInterview2().equals("Technical assessment conducted.")
                                                &&
                                                interviewNotes.getOtherMemo().equals("Pending final review.") &&
                                                interviewNotes.getStudent().equals(testStudent)));
        }

        @Test
        void testSaveInterviewNotesDTO_StudentNotFound() {
                InterviewNotesDTO dto = new InterviewNotesDTO();
                when(studentRepository.findById(studentId)).thenReturn(Optional.empty());

                RuntimeException exception = assertThrows(RuntimeException.class,
                                () -> interviewNotesService.saveInterviewNotesDTO(studentId, dto));
                assertEquals("Student not found: " + studentId, exception.getMessage());

                verify(studentRepository).findById(studentId);
                verify(interviewNotesRepository, never()).findByStudentId(anyLong());
                verify(interviewNotesRepository, never()).save(any());
        }

        @Test
        void getOrCreateInterviewNotesDTO_whenEntityNull_returnsEmptyDTO() {
                Mockito.when(interviewNotesRepository.findByStudentId(studentId))
                                .thenReturn(Optional.empty());

                InterviewNotesDTO dto = interviewNotesService.getOrCreateInterviewNotesDTO(studentId);

                assertNotNull(dto);
                assertEquals(studentId, dto.getStudentId());
                assertNull(dto.getInterview1());
                assertNull(dto.getInterview2());
                assertNull(dto.getInterview3());
                assertNull(dto.getOtherMemo());
        }

        @Test
        void testInterviewNotesSizeLimits() {
                String longText = "A".repeat(500);
                InterviewNotesDTO dto = InterviewNotesDTO.builder()
                                .interview1(longText)
                                .interview2(longText)
                                .interview3(longText)
                                .otherMemo(longText)
                                .build();

                when(studentRepository.findById(studentId)).thenReturn(Optional.of(testStudent));
                when(interviewNotesRepository.findByStudentId(studentId)).thenReturn(Optional.of(testInterviewNotes));
                when(interviewNotesRepository.save(any(InterviewNotes.class))).thenReturn(testInterviewNotes);

                interviewNotesService.saveInterviewNotesDTO(studentId, dto);

                verify(interviewNotesRepository)
                                .save(argThat(interviewNotes -> interviewNotes.getInterview1().length() == 500 &&
                                                interviewNotes.getInterview2().length() == 500 &&
                                                interviewNotes.getInterview3().length() == 500 &&
                                                interviewNotes.getOtherMemo().length() == 500));
        }

        @Test
        void testSaveInterviewNotesDTO_WithNullValues() {
                InterviewNotesDTO dto = InterviewNotesDTO.builder()
                                .interview1(null)
                                .interview2("Only second interview has data")
                                .interview3(null)
                                .otherMemo("Memo only")
                                .build();

                when(studentRepository.findById(studentId)).thenReturn(Optional.of(testStudent));
                when(interviewNotesRepository.findByStudentId(studentId)).thenReturn(Optional.of(testInterviewNotes));
                when(interviewNotesRepository.save(any(InterviewNotes.class))).thenReturn(testInterviewNotes);

                interviewNotesService.saveInterviewNotesDTO(studentId, dto);

                verify(interviewNotesRepository).save(argThat(interviewNotes -> interviewNotes.getInterview1() == null
                                &&
                                interviewNotes.getInterview2().equals("Only second interview has data") &&
                                interviewNotes.getInterview3() == null &&
                                interviewNotes.getOtherMemo().equals("Memo only")));
        }

        @Test
        void testSaveInterviewNotesDTO_WithEmptyStrings() {
                InterviewNotesDTO dto = InterviewNotesDTO.builder()
                                .interview1("")
                                .interview2("")
                                .interview3("")
                                .otherMemo("")
                                .build();

                when(studentRepository.findById(studentId)).thenReturn(Optional.of(testStudent));
                when(interviewNotesRepository.findByStudentId(studentId)).thenReturn(Optional.of(testInterviewNotes));
                when(interviewNotesRepository.save(any(InterviewNotes.class))).thenReturn(testInterviewNotes);

                interviewNotesService.saveInterviewNotesDTO(studentId, dto);

                verify(interviewNotesRepository)
                                .save(argThat(interviewNotes -> interviewNotes.getInterview1().isEmpty() &&
                                                interviewNotes.getInterview2().isEmpty() &&
                                                interviewNotes.getInterview3().isEmpty() &&
                                                interviewNotes.getOtherMemo().isEmpty()));
        }

        @Test
        void testGetOrCreateInterviewNotesDTO_MultipleCalls() {
                when(interviewNotesRepository.findByStudentId(studentId)).thenReturn(Optional.of(testInterviewNotes));

                // First call
                InterviewNotesDTO result1 = interviewNotesService.getOrCreateInterviewNotesDTO(studentId);
                assertNotNull(result1);

                // Second call - should use cached/mocked data
                InterviewNotesDTO result2 = interviewNotesService.getOrCreateInterviewNotesDTO(studentId);
                assertNotNull(result2);

                assertEquals(result1.getStudentId(), result2.getStudentId());
                assertEquals(result1.getInterview1(), result2.getInterview1());

                verify(interviewNotesRepository, times(2)).findByStudentId(studentId);
        }
}