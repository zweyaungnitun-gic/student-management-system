package com.gicm.student_management_system.service;

import com.gicm.student_management_system.dto.N4ClassDTO;

public interface N4ClassService {

    N4ClassDTO getOrCreateN4ClassDTO(Long studentId);

    void saveN4ClassDTO(Long studentId, N4ClassDTO n4ClassDTO);
}