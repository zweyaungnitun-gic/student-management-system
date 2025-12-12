package com.gicm.student_management_system.service;

import com.gicm.student_management_system.dto.StudentFullExportDTO;
import java.util.List;

public interface StudentExportService {
    List<StudentFullExportDTO> getAllStudentsFull(String nameSearch, String status);

    List<StudentFullExportDTO> getStudentsByIds(List<Long> ids);
}
