package com.gicm.student_management_system.service;

import com.gicm.student_management_system.dto.StudentDTO;
import com.gicm.student_management_system.entity.Student;

import java.util.List;
import java.util.Optional;

public interface StudentService {

    List<StudentDTO> getAllStudents();

    List<StudentDTO> getStudentsByFilter(String nameSearch, String status);

    StudentDTO getStudentById(Long id);

    StudentDTO createStudent(StudentDTO studentDTO);

    StudentDTO updateStudent(Long id, StudentDTO studentDTO);

    void deleteStudent(Long id);

    List<Student> findAll();

    Optional<Student> findById(Long id);

    List<Student> getStudentsByFilterFull(String nameSearch, String status);

    Student save(Student student);

    List<StudentDTO> getStudentsByStatuses(String nameSearch, List<String> statuses);

}
