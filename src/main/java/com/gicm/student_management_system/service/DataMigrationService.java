package com.gicm.student_management_system.service;

import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataMigrationService {
    private final StudentRepository studentRepository;

    @Transactional
    public void migrateExistingData() {
        // Find all students
        List<Student> students = studentRepository.findAll();
        List<Student> toUpdate = new ArrayList<>();

        log.info(" Found {} student records to check for migration", students.size());

        for (Student student : students) {
            boolean needsUpdate = false;

            // Fix createdAt if null - use updatedAt or today
            if (student.getCreatedAt() == null) {
                log.debug("Fixing null createdAt for student ID: {}", student.getStudentId());
                student.setCreatedAt(
                        student.getUpdatedAt() != null
                                ? student.getUpdatedAt() // Use updatedAt if available
                                : LocalDate.now() // Otherwise use today
                );
                needsUpdate = true;
            }

            // Fix enrolledDate if null - use createdAt (which we just fixed above)
            if (student.getEnrolledDate() == null) {
                log.debug("Fixing null enrolledDate for student ID: {}", student.getStudentId());
                student.setEnrolledDate(student.getCreatedAt()); // Same as createdAt
                needsUpdate = true;
            }

            if (needsUpdate) {
                toUpdate.add(student);
            }
        }

        if (!toUpdate.isEmpty()) {
            studentRepository.saveAll(toUpdate);
            log.info("Successfully migrated {} student records", toUpdate.size());

            // Log summary
            long nullCreatedAtFixed = toUpdate.stream()
                    .filter(s -> s.getCreatedAt() == null)
                    .count();
            long nullEnrolledDateFixed = toUpdate.stream()
                    .filter(s -> s.getEnrolledDate() == null)
                    .count();

            log.info("Migration summary: {} createdAt fields fixed, {} enrolledDate fields fixed",
                    nullCreatedAtFixed, nullEnrolledDateFixed);
        } else {
            log.info("No data migration needed - all records are already valid");
        }
    }
}