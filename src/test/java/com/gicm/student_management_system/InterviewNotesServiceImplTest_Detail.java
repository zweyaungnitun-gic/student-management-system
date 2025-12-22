package com.gicm.student_management_system;

import com.gicm.student_management_system.dto.InterviewNotesDTO;
import com.gicm.student_management_system.entity.InterviewNotes;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.InterviewNotesRepository;
import com.gicm.student_management_system.repository.StudentRepository;
import com.gicm.student_management_system.serviceimpl.InterviewNotesServiceImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InterviewNotesServiceImplTest_Detail {

    @Mock
    private InterviewNotesRepository interviewNotesRepository;

    @Mock
    private StudentRepository studentRepository; 

    @InjectMocks
    private InterviewNotesServiceImpl interviewNotesService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // Interview notes exist
    @Test
    void getOrCreateInterviewNotesDTO_whenExists() {

        Long studentId = 1L;

        Student student = new Student();
        student.setId(studentId);

        InterviewNotes interviewNotes = InterviewNotes.builder()
                .id(10L)
                .student(student)
                .interview1("Interview 1 memo")
                .interview2("Interview 2 memo")
                .interview3("Interview 3 memo")
                .otherMemo("Other memo")
                .build();

        when(interviewNotesRepository.findByStudentId(studentId))
                .thenReturn(Optional.of(interviewNotes));

        InterviewNotesDTO result =
                interviewNotesService.getOrCreateInterviewNotesDTO(studentId);

        assertNotNull(result);
        assertEquals(studentId, result.getStudentId());
        assertEquals("Interview 1 memo", result.getInterview1());
        assertEquals("Interview 2 memo", result.getInterview2());
        assertEquals("Interview 3 memo", result.getInterview3());
        assertEquals("Other memo", result.getOtherMemo());

        verify(interviewNotesRepository, times(1))
                .findByStudentId(studentId);
    }

    // Interview notes do NOT exist
    @Test
    void getOrCreateInterviewNotesDTO_whenNotExists() {

        Long studentId = 2L;

        when(interviewNotesRepository.findByStudentId(studentId))
                .thenReturn(Optional.empty());

        InterviewNotesDTO result =
                interviewNotesService.getOrCreateInterviewNotesDTO(studentId);

        assertNotNull(result);
        assertEquals(studentId, result.getStudentId());

        assertNull(result.getInterview1());
        assertNull(result.getInterview2());
        assertNull(result.getInterview3());
        assertNull(result.getOtherMemo());

        verify(interviewNotesRepository, times(1))
                .findByStudentId(studentId);
    }
}
