package com.gicm.student_management_system.serviceimpl;

import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gicm.student_management_system.dto.StudentRegistrationDTO;
import com.gicm.student_management_system.entity.RegistrationStatus;
import com.gicm.student_management_system.entity.StudentRegistration;
import com.gicm.student_management_system.repository.StudentRegistrationRepository;
import com.gicm.student_management_system.service.RegisterStudentService;

@Service
public class RegisterStudentServiceImpl implements RegisterStudentService {

    private final StudentRegistrationRepository studentRegistrationRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public RegisterStudentServiceImpl(StudentRegistrationRepository studentRegistrationRepository) {
        this.studentRegistrationRepository = studentRegistrationRepository;
    }

    @Override
    @Transactional
    public StudentRegistration registerStudent(StudentRegistrationDTO dto) {
        // National ID is still required and must be unique
        if (studentRegistrationRepository.existsByNationalIdNumber(dto.getNationalIdNumber())) {
            throw new RuntimeException("この国民ID番号は既に登録されています");
        }

        // Map DTO to Entity
        StudentRegistration registration = StudentRegistration.builder()
                .registrationCode(generateRegistrationCode())
                .registrationStatus(RegistrationStatus.PENDING)
                .englishName(dto.getEnglishName())
                .katakanaName(dto.getKatakanaName())
                .dateOfBirth(dto.getDob() == null || dto.getDob().isBlank() ? null
                        : java.time.LocalDate.parse(dto.getDob(), DATE_FORMATTER))
                .gender(dto.getGender())
                .currentAddress(dto.getCurrentAddress())
                .hometownAddress(dto.getHometownAddress())
                .phoneNumber(dto.getPhoneNumber())
                .guardianPhoneNumber(dto.getGuardianPhoneNumber())
                .fatherName(dto.getFatherName())
                .passportNumber(dto.getPassportNumber())
                .nationalIdNumber(dto.getNationalIdNumber())
                .jlptLevel(dto.getJlptLevel())
                .desiredOccupation(dto.getDesiredOccupation())
                .otherOccupation(dto.getOtherOccupation())
                .japanTravelExperience(dto.getJapanTravelExperience())
                .coeApplicationExperience(dto.getCoeApplicationExperience())
                .religion(dto.getReligion())
                .otherReligion(dto.getOtherReligion())
                .smoking(dto.getSmoking())
                .alcohol(dto.getAlcohol())
                .tattoo(dto.getTattoo())
                .tuitionPaymentDate(dto.getTuitionPaymentDate() == null || dto.getTuitionPaymentDate().isBlank() ? null
                        : java.time.LocalDate.parse(dto.getTuitionPaymentDate(), DATE_FORMATTER))
                .wantDorm(dto.getWantDorm())
                .otherMemo(dto.getOtherMemo())
                .submittedAt(java.time.LocalDate.now())
                .build();

        // Save to database
        return studentRegistrationRepository.save(registration);
    }

    private String generateRegistrationCode() {
        String prefix = "REG-";
        long count = studentRegistrationRepository.count() + 1;
        String code = prefix + String.format("%06d", count);
        while (studentRegistrationRepository.existsByRegistrationCode(code)) {
            count++;
            code = prefix + String.format("%06d", count);
        }
        return code;
    }
}
