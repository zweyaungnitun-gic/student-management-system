package com.gicm.student_management_system.service;

import com.gicm.student_management_system.dto.TeacherDTO;

import java.util.List;
import java.util.Optional;

public interface TeacherService {
    List<TeacherDTO> getAllTeachers();
    Optional<TeacherDTO> getTeacherById(Long id);
    Optional<TeacherDTO> getTeacherByEmail(String email);
    TeacherDTO createTeacher(TeacherDTO teacherDTO);
    TeacherDTO updateTeacher(Long id, TeacherDTO teacherDTO);
    void deleteTeacher(Long id);
    boolean existsByEmail(String email);
    List<TeacherDTO> searchTeachers(String search);
}