package com.gicm.student_management_system.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gicm.student_management_system.entity.RegistrationStatus;
import com.gicm.student_management_system.entity.StudentRegistration;

@Repository
public interface StudentRegistrationRepository extends JpaRepository<StudentRegistration, Long> {
    boolean existsByRegistrationCode(String registrationCode);

    boolean existsByNationalIdNumber(String nationalIdNumber);

    Optional<StudentRegistration> findByRegistrationCode(String registrationCode);

    List<StudentRegistration> findByRegistrationStatusOrderBySubmittedAtDesc(RegistrationStatus registrationStatus);

    List<StudentRegistration> findByRegistrationStatusAndEnglishNameIgnoreCaseContainingOrderBySubmittedAtDesc(
            RegistrationStatus registrationStatus, String englishName);

    long countByRegistrationStatus(RegistrationStatus registrationStatus);

    List<StudentRegistration> findTop5ByRegistrationStatusOrderBySubmittedAtDesc(RegistrationStatus registrationStatus);
}

