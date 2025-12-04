package com.gicm.student_management_system.service;

import com.gicm.student_management_system.dto.StudentDTO;

import java.util.List;

public interface StudentService {

    List<StudentDTO> getAllStudents();

    List<StudentDTO> getStudentsByFilter(String nameSearch, String status);

    StudentDTO getStudentById(Long id);

    StudentDTO createStudent(StudentDTO studentDTO);

    StudentDTO updateStudent(Long id, StudentDTO studentDTO);

    void deleteStudent(Long id);
}
