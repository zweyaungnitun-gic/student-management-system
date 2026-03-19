package com.gicm.student_management_system.service;

import com.gicm.student_management_system.dto.StudentRegistrationDTO;
import com.gicm.student_management_system.entity.StudentRegistration;

public interface RegisterStudentService {
    StudentRegistration registerStudent(StudentRegistrationDTO dto);
}
