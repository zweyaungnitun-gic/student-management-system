package com.gicm.student_management_system;

import com.gicm.student_management_system.dto.N5ClassDTO;
import com.gicm.student_management_system.entity.N5Class;
import com.gicm.student_management_system.repository.N5ClassRepository;
import com.gicm.student_management_system.repository.StudentRepository;
import com.gicm.student_management_system.serviceimpl.N5ClassServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;


import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class N5ClassServiceImplTest_Detail {

    @Mock
    private N5ClassRepository n5ClassRepository;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private N5ClassServiceImpl n5ClassService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // --- Test: N5Class exists ---
    @Test
    void getOrCreateN5ClassDTO_exists() {
        Long studentId = 1L;

        N5Class n5Class = new N5Class();
        n5Class.setId(10L);
        n5Class.setN5ClassTeacher("Mr. Tanaka");

        when(n5ClassRepository.findByStudentId(studentId))
                .thenReturn(Optional.of(n5Class));

        N5ClassDTO dto = n5ClassService.getOrCreateN5ClassDTO(studentId);

        assertNotNull(dto);
        assertEquals(10L, dto.getId());
        assertEquals("Mr. Tanaka", dto.getN5ClassTeacher());

        verify(n5ClassRepository, times(1)).findByStudentId(studentId);
    }

    // --- Test: N5Class does not exist ---
    @Test
    void getOrCreateN5ClassDTO_notExists() {
        Long studentId = 2L;

        when(n5ClassRepository.findByStudentId(studentId))
                .thenReturn(Optional.empty());

        N5ClassDTO dto = n5ClassService.getOrCreateN5ClassDTO(studentId);

        assertNotNull(dto);
        assertNull(dto.getId()); // No entity exists
        assertEquals(studentId, dto.getStudentId()); // Student ID is set for the page

        verify(n5ClassRepository, times(1)).findByStudentId(studentId);
    }
}
