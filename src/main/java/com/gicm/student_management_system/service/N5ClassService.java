package com.gicm.student_management_system.service;

import com.gicm.student_management_system.dto.N5ClassDTO;

public interface N5ClassService {

    N5ClassDTO getOrCreateN5ClassDTO(Long studentId);

    void saveN5ClassDTO(Long studentId, N5ClassDTO n5ClassDTO);
}