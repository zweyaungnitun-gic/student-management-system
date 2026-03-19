package com.gicm.student_management_system.service;

import java.util.List;

import com.gicm.student_management_system.dto.StudentRegistrationDTO;
import com.gicm.student_management_system.entity.RegistrationStatus;
import com.gicm.student_management_system.entity.StudentRegistration;

public interface StudentRegistrationService {
    StudentRegistration submitRegistration(StudentRegistrationDTO dto);

    List<StudentRegistration> listRegistrations(RegistrationStatus status, String nameSearch);

    StudentRegistration getRegistration(Long registrationId);

    StudentRegistration updateRegistration(Long registrationId, StudentRegistrationDTO dto);

    void deleteRegistration(Long registrationId);

    StudentRegistration acceptRegistration(Long registrationId, String decidedBy);

    StudentRegistration rejectRegistration(Long registrationId, String decidedBy);

    long countByStatus(RegistrationStatus status);

    List<StudentRegistration> listRecentAccepted(int limit);
}

