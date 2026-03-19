package com.gicm.student_management_system.serviceimpl;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gicm.student_management_system.dto.StudentRegistrationDTO;
import com.gicm.student_management_system.entity.RegistrationStatus;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.RegisterStudentRepository;
import com.gicm.student_management_system.service.RegisterStudentService;

@Service
public class RegisterStudentServiceImpl implements RegisterStudentService {

    private final RegisterStudentRepository registerStudentRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public RegisterStudentServiceImpl(RegisterStudentRepository registerStudentRepository) {
        this.registerStudentRepository = registerStudentRepository;
    }

    @Override
    @Transactional
    public Student registerStudent(StudentRegistrationDTO dto) {
        // National ID is still required and must be unique
        if (registerStudentRepository.existsByNationalId(dto.getNationalIdNumber())) {
            throw new RuntimeException("この国民ID番号は既に登録されています");
        }

        // Generate unique student ID
        String studentId = generateStudentId();

        // Map DTO to Entity
        Student student = Student.builder()
            .studentId(studentId)
            .studentName(dto.getEnglishName())
            .dateOfBirth(LocalDate.parse(dto.getDob(), DATE_FORMATTER))
            .gender(dto.getGender())
            .currentLivingAddress(dto.getCurrentAddress())
            .homeTownAddress(dto.getHometownAddress())
            .phoneNumber(dto.getPhoneNumber())
            .religion(dto.getReligion())
            .nationalId(dto.getNationalIdNumber())
            .enrolledDate(LocalDate.now()) // Add this line - same as createdAt
            .registrationStatus(RegistrationStatus.PENDING)
            .build();

        // Save to database
        return registerStudentRepository.save(student);
    }

    @Override
    public String generateStudentId() {
        // Format: STUXXX (e.g., STU001, STU002)
        String prefix = "STU";

        // Get the total count of students + 1
        long count = registerStudentRepository.count() + 1;
        String sequence = String.format("%03d", count);

        String newStudentId = prefix + sequence;

        // if deleted IDs exist, not reuse them, always increment
        while (registerStudentRepository.existsByStudentId(newStudentId)) {
            count++;
            sequence = String.format("%03d", count);
            newStudentId = prefix + sequence;
        }

        return newStudentId;
    }

    // No longer needed: convertToBoolean for boolean fields
}
