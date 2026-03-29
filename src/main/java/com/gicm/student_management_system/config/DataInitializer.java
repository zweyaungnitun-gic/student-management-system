package com.gicm.student_management_system.config;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.gicm.student_management_system.entity.RegistrationStatus;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.StudentRepository;
import com.gicm.student_management_system.service.StudentIdGeneratorService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final StudentIdGeneratorService idGeneratorService;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking for sample students for admin 2...");
        long count = studentRepository.findByCreatedBy(2L).size();
        if (count < 20) {
            long studentsToAdd = 20 - count;
            log.info("Adding {} sample students for admin 2 to reach 20...", studentsToAdd);
            for (int i = 1; i <= studentsToAdd; i++) {
                Student student = Student.builder()
                        .studentName("Sample Student " + (count + i))
                        .studentId(idGeneratorService.generateStudentId())
                        .nationalId("NID-" + UUID.randomUUID().toString().substring(0, 8))
                        .gender((count + i) % 2 == 0 ? "Male" : "Female")
                        .dateOfBirth(LocalDate.of(2000, 1, 1).plusDays(count + i))
                        .enrolledDate(LocalDate.now())
                        .registrationStatus(RegistrationStatus.ACCEPTED)
                        .createdBy(2L)
                        .createdAt(LocalDate.now())
                        .updatedAt(LocalDate.now())
                        .build();
                studentRepository.save(student);
                log.info("Saved student: {} with ID: {}", student.getStudentName(), student.getStudentId());
            }
            log.info("Finished adding sample students.");
        } else {
            log.info("Admin 2 already has {} students. No more added.", count);
        }
    }
}
