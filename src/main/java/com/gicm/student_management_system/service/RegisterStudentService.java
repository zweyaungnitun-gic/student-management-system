package com.gicm.student_management_system.service;

import com.gicm.student_management_system.dto.StudentRegistrationDTO;
import com.gicm.student_management_system.entity.Student;

public interface RegisterStudentService {
    Student registerStudent(StudentRegistrationDTO dto);
    String generateStudentId();
}
