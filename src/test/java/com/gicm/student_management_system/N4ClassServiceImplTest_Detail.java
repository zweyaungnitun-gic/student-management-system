package com.gicm.student_management_system;

import com.gicm.student_management_system.dto.N4ClassDTO;
import com.gicm.student_management_system.entity.N4Class;
import com.gicm.student_management_system.repository.N4ClassRepository;
import com.gicm.student_management_system.repository.StudentRepository;
import com.gicm.student_management_system.serviceimpl.N4ClassServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class N4ClassServiceImplTest_Detail {

    @Mock
    private N4ClassRepository n4ClassRepository;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private N4ClassServiceImpl n4ClassService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    //exists
    @Test
    void getOrCreateN4ClassDTO_exists() {
        Long studentId = 1L;

        N4Class n4Class = new N4Class();
        n4Class.setId(100L);
        n4Class.setN4ClassTeacher("Ms. Yamada");

        when(n4ClassRepository.findByStudentId(studentId))
                .thenReturn(Optional.of(n4Class));

        N4ClassDTO dto = n4ClassService.getOrCreateN4ClassDTO(studentId);

        assertNotNull(dto);
        assertEquals(100L, dto.getId());
        assertEquals("Ms. Yamada", dto.getN4ClassTeacher());

        verify(n4ClassRepository, times(1)).findByStudentId(studentId);
    }

    // N4Class does not exist 
    @Test
    void getOrCreateN4ClassDTO_notExists() {
        Long studentId = 2L;

        when(n4ClassRepository.findByStudentId(studentId))
                .thenReturn(Optional.empty());

        N4ClassDTO dto = n4ClassService.getOrCreateN4ClassDTO(studentId);

        assertNotNull(dto);
        assertNull(dto.getId());
        assertEquals(studentId, dto.getStudentId());

        verify(n4ClassRepository, times(1)).findByStudentId(studentId);
    }
}

