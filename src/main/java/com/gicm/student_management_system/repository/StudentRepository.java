package com.gicm.student_management_system.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.gicm.student_management_system.entity.RegistrationStatus;
import com.gicm.student_management_system.entity.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    // Case-insensitive search by name only
    List<Student> findByStudentNameIgnoreCaseContaining(String studentName);

    // Multi-tenancy: filter by createdBy (admin user ID)
    List<Student> findByCreatedBy(Long createdBy);

    List<Student> findByCreatedByAndStudentNameIgnoreCaseContaining(Long createdBy, String studentName);

    // Find all for super admin
    @Query("SELECT s FROM Student s")
    List<Student> findAllForSuperAdmin();

    @Query("SELECT s FROM Student s WHERE LOWER(s.studentName) LIKE LOWER(CONCAT('%', :nameSearch, '%'))")
    List<Student> findAllByNameForSuperAdmin(String nameSearch);

    Student findTopByOrderByIdDesc();

    @Query("SELECT MAX(s.studentId) FROM Student s WHERE s.studentId LIKE 'STU%'")
    String findMaxStudentId();

    Optional<Student> findByStudentId(String studentId);

    // Find students with null createdAt (for migration)
    @Query("SELECT s FROM Student s WHERE s.createdAt IS NULL")
    List<Student> findByCreatedAtIsNull();

    // Find students with null enrolledDate (for migration)
    @Query("SELECT s FROM Student s WHERE s.enrolledDate IS NULL")
    List<Student> findByEnrolledDateIsNull();

    // Finds a student with the same National ID but a different primary ID
    Optional<Student> findByNationalIdAndIdNot(String nationalId, Long id);

    // Multi-tenancy: check if student belongs to admin
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN TRUE ELSE FALSE END FROM Student s WHERE s.id = :studentId AND s.createdBy = :adminId")
    boolean existsByIdAndCreatedBy(Long studentId, Long adminId);

    // Find students by registration status
    List<Student> findByRegistrationStatus(RegistrationStatus registrationStatus);

    // Multi-tenancy: find by registration status and createdBy
    List<Student> findByRegistrationStatusAndCreatedBy(RegistrationStatus registrationStatus, Long createdBy);

    List<Student> findByRegistrationStatusAndStudentNameIgnoreCaseContaining(RegistrationStatus registrationStatus,
            String studentName);

    // Multi-tenancy: find by registration status, name and createdBy
    List<Student> findByRegistrationStatusAndCreatedByAndStudentNameIgnoreCaseContaining(
            RegistrationStatus registrationStatus, Long createdBy, String studentName);
}