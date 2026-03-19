package com.gicm.student_management_system.serviceimpl;

import com.gicm.student_management_system.dto.StudentFullExportDTO;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.service.StudentExportService;
import com.gicm.student_management_system.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentExportServiceImpl implements StudentExportService {

    private final StudentService studentService;

    @Override
    public List<StudentFullExportDTO> getAllStudentsFull(String nameSearch) {
        return studentService.getStudentsByFilterFull(nameSearch).stream()
                .map(this::convertToExportDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentFullExportDTO> getStudentsByIds(List<Long> ids) {
        // Use the new efficient method
        return studentService.findAllByIds(ids).stream()
                .map(this::convertToExportDTO)
                .collect(Collectors.toList());
    }

    private StudentFullExportDTO convertToExportDTO(Student s) {
        StudentFullExportDTO dto = new StudentFullExportDTO();

        // --- Common student fields (aligned with current Student entity) ---
        dto.setId(s.getId());
        dto.setStudentId(s.getStudentId());
        dto.setStudentName(s.getStudentName());
        dto.setDateOfBirth(s.getDateOfBirth() != null ? s.getDateOfBirth().toString()
                : "");
        dto.setGender(s.getGender());
        dto.setCurrentLivingAddress(s.getCurrentLivingAddress());
        dto.setHomeTownAddress(s.getHomeTownAddress());
        dto.setPhoneNumber(s.getPhoneNumber());
        dto.setReligion(s.getReligion());
        dto.setEnrolledDate(s.getEnrolledDate() != null ? s.getEnrolledDate().toString() : "");
        dto.setNationalID(s.getNationalId());

        return dto;
    }
}