package com.gicm.student_management_system.serviceimpl;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gicm.student_management_system.dto.StudentDTO;
import com.gicm.student_management_system.dto.StudentRegistrationDTO;
import com.gicm.student_management_system.entity.AdditionalStudentInfo;
import com.gicm.student_management_system.entity.RegistrationStatus;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.entity.StudentRegistration;
import com.gicm.student_management_system.repository.AdditionalStudentInfoRepository;
import com.gicm.student_management_system.repository.StudentRegistrationRepository;
import com.gicm.student_management_system.service.StudentRegistrationService;
import com.gicm.student_management_system.service.StudentService;

@Service
public class StudentRegistrationServiceImpl implements StudentRegistrationService {

    private final StudentRegistrationRepository studentRegistrationRepository;
    private final StudentService studentService;
    private final AdditionalStudentInfoRepository additionalStudentInfoRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public StudentRegistrationServiceImpl(
            StudentRegistrationRepository studentRegistrationRepository,
            StudentService studentService,
            AdditionalStudentInfoRepository additionalStudentInfoRepository) {
        this.studentRegistrationRepository = studentRegistrationRepository;
        this.studentService = studentService;
        this.additionalStudentInfoRepository = additionalStudentInfoRepository;
    }

    @Override
    @Transactional
    public StudentRegistration submitRegistration(StudentRegistrationDTO dto) {
        if (studentRegistrationRepository.existsByNationalIdNumber(dto.getNationalIdNumber())) {
            throw new RuntimeException("この国民ID番号は既に登録されています");
        }
        if (studentService.isNationalIdDuplicate(dto.getNationalIdNumber(), -1L)) {
            throw new RuntimeException("この国民ID番号は既に登録されています");
        }

        StudentRegistration registration = StudentRegistration.builder()
                .registrationCode(generateRegistrationCode())
                .registrationStatus(RegistrationStatus.PENDING)
                .submittedAt(LocalDate.now())
                .englishName(dto.getEnglishName())
                .katakanaName(dto.getKatakanaName())
                .dateOfBirth(dto.getDob() == null || dto.getDob().isBlank() ? null
                        : LocalDate.parse(dto.getDob(), DATE_FORMATTER))
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
                        : LocalDate.parse(dto.getTuitionPaymentDate(), DATE_FORMATTER))
                .wantDorm(dto.getWantDorm())
                .otherMemo(dto.getOtherMemo())
                .build();

        return studentRegistrationRepository.save(registration);
    }

    @Override
    public List<StudentRegistration> listRegistrations(RegistrationStatus status, String nameSearch) {
        if (nameSearch == null || nameSearch.isBlank()) {
            return studentRegistrationRepository.findByRegistrationStatusOrderBySubmittedAtDesc(status);
        }
        return studentRegistrationRepository.findByRegistrationStatusAndEnglishNameIgnoreCaseContainingOrderBySubmittedAtDesc(
                status, nameSearch);
    }

    @Override
    public StudentRegistration getRegistration(Long registrationId) {
        return studentRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found: " + registrationId));
    }

    @Override
    @Transactional
    public StudentRegistration updateRegistration(Long registrationId, StudentRegistrationDTO dto) {
        StudentRegistration reg = studentRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found: " + registrationId));

        // Only allow edits while still pending (keeps audit trail consistent after decision)
        if (reg.getRegistrationStatus() != RegistrationStatus.PENDING) {
            throw new RuntimeException("処理済みの申請は編集できません");
        }

        // If nationalId changes, keep uniqueness
        if (dto.getNationalIdNumber() != null && !dto.getNationalIdNumber().isBlank()
                && !dto.getNationalIdNumber().equals(reg.getNationalIdNumber())) {
            if (studentRegistrationRepository.existsByNationalIdNumber(dto.getNationalIdNumber())) {
                throw new RuntimeException("この国民ID番号は既に登録されています");
            }
            if (studentService.isNationalIdDuplicate(dto.getNationalIdNumber(), -1L)) {
                throw new RuntimeException("この国民ID番号は既に登録されています");
            }
            reg.setNationalIdNumber(dto.getNationalIdNumber());
        }

        reg.setEnglishName(dto.getEnglishName());
        reg.setKatakanaName(dto.getKatakanaName());
        reg.setDateOfBirth(dto.getDob() == null || dto.getDob().isBlank() ? null
                : LocalDate.parse(dto.getDob(), DATE_FORMATTER));
        reg.setGender(dto.getGender());
        reg.setCurrentAddress(dto.getCurrentAddress());
        reg.setHometownAddress(dto.getHometownAddress());
        reg.setPhoneNumber(dto.getPhoneNumber());
        reg.setGuardianPhoneNumber(dto.getGuardianPhoneNumber());

        reg.setFatherName(dto.getFatherName());
        reg.setPassportNumber(dto.getPassportNumber());
        reg.setJlptLevel(dto.getJlptLevel());
        reg.setDesiredOccupation(dto.getDesiredOccupation());
        reg.setOtherOccupation(dto.getOtherOccupation());
        reg.setJapanTravelExperience(dto.getJapanTravelExperience());
        reg.setCoeApplicationExperience(dto.getCoeApplicationExperience());

        reg.setReligion(dto.getReligion());
        reg.setOtherReligion(dto.getOtherReligion());
        reg.setSmoking(dto.getSmoking());
        reg.setAlcohol(dto.getAlcohol());
        reg.setTattoo(dto.getTattoo());
        reg.setTuitionPaymentDate(dto.getTuitionPaymentDate() == null || dto.getTuitionPaymentDate().isBlank() ? null
                : LocalDate.parse(dto.getTuitionPaymentDate(), DATE_FORMATTER));
        reg.setWantDorm(dto.getWantDorm());
        reg.setOtherMemo(dto.getOtherMemo());

        return studentRegistrationRepository.save(reg);
    }

    @Override
    @Transactional
    public void deleteRegistration(Long registrationId) {
        StudentRegistration reg = studentRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found: " + registrationId));

        // Prevent deleting an accepted registration that already created a Student record
        if (reg.getRegistrationStatus() == RegistrationStatus.ACCEPTED) {
            throw new RuntimeException("承認済みの申請は削除できません");
        }
        studentRegistrationRepository.delete(reg);
    }

    @Override
    @Transactional
    public StudentRegistration acceptRegistration(Long registrationId, String decidedBy) {
        StudentRegistration reg = studentRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found: " + registrationId));

        if (reg.getRegistrationStatus() != RegistrationStatus.PENDING) {
            throw new RuntimeException("この申請は既に処理済みです");
        }

        StudentDTO studentDTO = new StudentDTO();
        studentDTO.setStudentId(null);
        studentDTO.setStudentName(reg.getEnglishName()); // Using englishName as studentName
        studentDTO.setGender(reg.getGender());
        studentDTO.setPhoneNumber(reg.getPhoneNumber());
        studentDTO.setNationalId(reg.getNationalIdNumber()); // Map nationalIdNumber to nationalId
        studentDTO.setReligion(reg.getReligion());
        studentDTO.setCurrentLivingAddress(reg.getCurrentAddress()); // Map currentAddress to currentLivingAddress
        studentDTO.setHomeTownAddress(reg.getHometownAddress()); // Map hometownAddress to homeTownAddress
        studentDTO.setDateOfBirth(reg.getDateOfBirth());
        studentDTO.setEnrolledDate(LocalDate.now());

        StudentDTO created = studentService.createStudent(studentDTO);
        Student student = studentService.findById(created.getId())
                .orElseThrow(() -> new RuntimeException("Student not found after create: " + created.getId()));

        if (!additionalStudentInfoRepository.existsByCommonStudent_Id(student.getId())) {
            AdditionalStudentInfo additional = AdditionalStudentInfo.builder()
                    .commonStudent(student)
                    .nameInJapanese(reg.getKatakanaName())
                    .passportNumber(reg.getPassportNumber())
                    .currentJapanLevel(reg.getJlptLevel())
                    .japanTravelExperience(reg.getJapanTravelExperience())
                    .coeApplicationExperience(reg.getCoeApplicationExperience())
                    .passedHighestJlptLevel(reg.getJlptLevel())
                    .secondaryPhone(reg.getGuardianPhoneNumber())
                    .fatherName(reg.getFatherName())
                    .desiredJobType(reg.getDesiredOccupation())
                    .otherDesiredJobType(reg.getOtherOccupation())
                    .isSmoking(reg.getSmoking())
                    .isAlcoholDrink(reg.getAlcohol())
                    .haveTatto(reg.getTattoo())
                    .hostelPreference(reg.getWantDorm())
                    .memoNotes(reg.getOtherMemo())
                    .schedulePaymentTutionDate(reg.getTuitionPaymentDate())
                    .otherReligion(reg.getOtherReligion())
                    .build();
            additionalStudentInfoRepository.save(additional);
        }

        reg.setRegistrationStatus(RegistrationStatus.ACCEPTED);
        reg.setDecidedAt(LocalDate.now());
        reg.setDecidedBy(decidedBy);
        reg.setAcceptedStudentId(student.getStudentId());
        return studentRegistrationRepository.save(reg);
    }

    @Override
    @Transactional
    public StudentRegistration rejectRegistration(Long registrationId, String decidedBy) {
        StudentRegistration reg = studentRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found: " + registrationId));

        if (reg.getRegistrationStatus() != RegistrationStatus.PENDING) {
            throw new RuntimeException("この申請は既に処理済みです");
        }

        reg.setRegistrationStatus(RegistrationStatus.REJECTED);
        reg.setDecidedAt(LocalDate.now());
        reg.setDecidedBy(decidedBy);
        return studentRegistrationRepository.save(reg);
    }

    @Override
    public long countByStatus(RegistrationStatus status) {
        return studentRegistrationRepository.countByRegistrationStatus(status);
    }

    @Override
    public List<StudentRegistration> listRecentAccepted(int limit) {
        // Repository method fixed to top5; respect limit for callers by subList
        List<StudentRegistration> top = studentRegistrationRepository
                .findTop5ByRegistrationStatusOrderBySubmittedAtDesc(RegistrationStatus.ACCEPTED);
        if (limit <= 0 || top.isEmpty() || top.size() <= limit) {
            return top;
        }
        return top.subList(0, limit);
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