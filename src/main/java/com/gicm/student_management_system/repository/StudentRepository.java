package com.gicm.student_management_system.repository;

import com.gicm.student_management_system.entity.RegistrationStatus;
import com.gicm.student_management_system.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    // Case-insensitive search by name only
    List<Student> findByStudentNameIgnoreCaseContaining(String studentName);

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

    // Find students by registration status
    List<Student> findByRegistrationStatus(RegistrationStatus registrationStatus);

    List<Student> findByRegistrationStatusAndStudentNameIgnoreCaseContaining(RegistrationStatus registrationStatus,
            String studentName);
}