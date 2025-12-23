package com.gicm.student_management_system.serviceimpl;

import com.gicm.student_management_system.dto.StudentDTO;
import com.gicm.student_management_system.entity.InterviewNotes;
import com.gicm.student_management_system.entity.N4Class;
import com.gicm.student_management_system.entity.N5Class;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.StudentRepository;
import com.gicm.student_management_system.service.StudentIdGeneratorService;
import com.gicm.student_management_system.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final StudentIdGeneratorService idGeneratorService;

    public StudentDTO convertToDTO(Student student) {
        if (student == null) {
            return null;
        }

        N5Class n5Class = student.getN5Class();
        N4Class n4Class = student.getN4Class();
        InterviewNotes interviewNotes = student.getInterviewNotes();

        return StudentDTO.builder()
                .id(student.getId())
                .studentId(student.getStudentId())

                .studentName(student.getStudentName())
                .nameInJapanese(student.getNameInJapanese())
                .dateOfBirth(student.getDateOfBirth())
                .gender(student.getGender())

                .religion(student.getReligion())
                .otherReligion(student.getOtherReligion())
                .nationalID(student.getNationalID())
                .passportNumber(student.getPassportNumber())
                .fatherName(student.getFatherName())

                .currentJapanLevel(student.getCurrentJapanLevel())
                .passedHighestJLPTLevel(student.getPassedHighestJLPTLevel())

                .desiredJobType(student.getDesiredJobType())
                .otherDesiredJobType(student.getOtherDesiredJobType())

                .isSmoking(student.getIsSmoking())
                .isAlcoholDrink(student.getIsAlcoholDrink())
                .haveTatto(student.getHaveTatto())
                .hostelPreference(student.getHostelPreference())

                .japanTravelExperience(student.getJapanTravelExperience())
                .coeApplicationExperience(student.getCoeApplicationExperience())

                .memoNotes(student.getMemoNotes())

                .phoneNumber(student.getPhoneNumber())
                .secondaryPhone(student.getSecondaryPhone())
                .contactViber(student.getContactViber())
                .currentLivingAddress(student.getCurrentLivingAddress())
                .homeTownAddress(student.getHomeTownAddress())

                .status(student.getStatus())
                .enrolledDate(student.getEnrolledDate())

                .schedulePaymentTutionDate(student.getSchedulePaymentTutionDate())
                .actualTutionPaymentDate(student.getActualTutionPaymentDate())
                .paymentDueDate(student.getSchedulePaymentTutionDate())
                .paymentDate(student.getActualTutionPaymentDate())

                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())

                .interviewNotes(interviewNotes)
                .build();
    }

    private Student convertToEntity(StudentDTO dto) {
        return convertToEntity(dto, null);
    }

    private Student convertToEntity(StudentDTO dto, Student existing) {
        Student student = (existing != null) ? existing : new Student();

        if (existing == null && (dto.getStudentId() == null || dto.getStudentId().isBlank())) {
            String generatedId = idGeneratorService.generateStudentId();
            student.setStudentId(generatedId);
        } else if (dto.getStudentId() != null && !dto.getStudentId().isBlank()) {
            student.setStudentId(dto.getStudentId());
        }

        if (dto.getStudentName() != null) {
            student.setStudentName(dto.getStudentName());
        }
        if (dto.getNameInJapanese() != null) {
            student.setNameInJapanese(dto.getNameInJapanese());
        }
        if (dto.getDateOfBirth() != null) {
            student.setDateOfBirth(dto.getDateOfBirth());
        }
        if (dto.getGender() != null) {
            student.setGender(dto.getGender());
        }

        if (dto.getPhoneNumber() != null) {
            student.setPhoneNumber(dto.getPhoneNumber());
        }
        if (dto.getSecondaryPhone() != null) {
            student.setSecondaryPhone(dto.getSecondaryPhone());
        }
        if (dto.getContactViber() != null) {
            student.setContactViber(dto.getContactViber());
        }
        if (dto.getCurrentLivingAddress() != null) {
            student.setCurrentLivingAddress(dto.getCurrentLivingAddress());
        }
        if (dto.getHomeTownAddress() != null) {
            student.setHomeTownAddress(dto.getHomeTownAddress());
        }

        if (dto.getFatherName() != null) {
            student.setFatherName(dto.getFatherName());
        }
        if (dto.getPassportNumber() != null) {
            student.setPassportNumber(dto.getPassportNumber());
        }
        if (dto.getNationalID() != null) {
            student.setNationalID(dto.getNationalID());
        }

        if (dto.getCurrentJapanLevel() != null) {
            student.setCurrentJapanLevel(dto.getCurrentJapanLevel());
        }
        if (dto.getPassedHighestJLPTLevel() != null) {
            student.setPassedHighestJLPTLevel(dto.getPassedHighestJLPTLevel());
        }
        // if (dto.getAttendingClassRelatedStatus() != null) {
        // student.setAttendingClassRelatedStatus(dto.getAttendingClassRelatedStatus());
        // }

        if (dto.getDesiredJobType() != null) {
            student.setDesiredJobType(dto.getDesiredJobType());
        }
        if (dto.getOtherDesiredJobType() != null) {
            student.setOtherDesiredJobType(dto.getOtherDesiredJobType());
        }

        if (dto.getJapanTravelExperience() != null) {
            student.setJapanTravelExperience(dto.getJapanTravelExperience());
        }
        if (dto.getCoeApplicationExperience() != null) {
            student.setCoeApplicationExperience(dto.getCoeApplicationExperience());
        }

        if (dto.getReligion() != null) {
            student.setReligion(dto.getReligion());
        }
        if (dto.getOtherReligion() != null) {
            student.setOtherReligion(dto.getOtherReligion());
        }

        if (dto.getIsSmoking() != null) {
            student.setIsSmoking(dto.getIsSmoking());
        }
        if (dto.getIsAlcoholDrink() != null) {
            student.setIsAlcoholDrink(dto.getIsAlcoholDrink());
        }
        if (dto.getHaveTatto() != null) {
            student.setHaveTatto(dto.getHaveTatto());
        }

        if (dto.getHostelPreference() != null) {
            student.setHostelPreference(dto.getHostelPreference());
        }

        if (dto.getSchedulePaymentTutionDate() != null) {
            student.setSchedulePaymentTutionDate(dto.getSchedulePaymentTutionDate());
        }
        if (dto.getActualTutionPaymentDate() != null) {
            student.setActualTutionPaymentDate(dto.getActualTutionPaymentDate());
        }

        if (dto.getMemoNotes() != null) {
            student.setMemoNotes(dto.getMemoNotes());
        }

        if (dto.getEnrolledDate() != null) {
            student.setEnrolledDate(dto.getEnrolledDate());
        }

        if (dto.getStatus() != null) {
            student.setStatus(dto.getStatus());
        }

        if (existing == null) {
            student.setCreatedAt(LocalDate.now());
        }
        student.setUpdatedAt(LocalDate.now());

        return student;
    }

    @Override
    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentDTO> getStudentsByFilter(String nameSearch, String status) {
        List<Student> students;
        boolean hasName = nameSearch != null && !nameSearch.isBlank();
        boolean hasStatus = status != null && !status.isBlank();

        if (hasName && hasStatus) {
            students = studentRepository.findByStudentNameIgnoreCaseContainingAndStatus(nameSearch, status);
        } else if (hasName) {
            students = studentRepository.findByStudentNameIgnoreCaseContaining(nameSearch);
        } else if (hasStatus) {
            students = studentRepository.findByStatus(status);
        } else {
            students = studentRepository.findAll();
        }

        return students.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public StudentDTO getStudentById(Long id) {
        return studentRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Override
    public Optional<Student> findById(Long id) {
        return studentRepository.findById(id);
    }

    public Student findByStudentId(String studentId) {
        return studentRepository.findByStudentId(studentId)
                .orElse(null);
    }

    @Override
    @Transactional
    public StudentDTO createStudent(StudentDTO dto) {
        dto.setStudentId(null);

        Student student = convertToEntity(dto);
        Student saved = studentRepository.save(student);

        dto.setStudentId(saved.getStudentId());
        dto.setId(saved.getId());

        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public StudentDTO updateStudent(Long id, StudentDTO dto) {
        Optional<Student> opt = studentRepository.findById(id);
        if (opt.isEmpty()) {
            return null;
        }

        Student existing = opt.get();

        dto.setStudentId(existing.getStudentId());

        if (dto.getStudentName() != null) {
            existing.setStudentName(dto.getStudentName());
        }

        if (dto.getGender() != null) {
            existing.setGender(dto.getGender());
        }

        if (dto.getPhoneNumber() != null) {
            existing.setPhoneNumber(dto.getPhoneNumber());
        }

        if (dto.getDesiredJobType() != null) {
            existing.setDesiredJobType(dto.getDesiredJobType());
        }

        if (dto.getStatus() != null) {
            existing.setStatus(dto.getStatus());
        }

        if (dto.getPaymentDueDate() != null) {
            existing.setSchedulePaymentTutionDate(dto.getPaymentDueDate());
        }

        if (dto.getPaymentDate() != null) {
            existing.setActualTutionPaymentDate(dto.getPaymentDate());
        }

        existing.setUpdatedAt(LocalDate.now());

        Student saved = studentRepository.save(existing);
        return convertToDTO(saved);
    }

    @Override
    public List<Student> findAllByIds(List<Long> ids) {
        return studentRepository.findAllById(ids);
    }

    @Override
    @Transactional
    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }

    @Override
    public List<Student> findAll() {
        return studentRepository.findAll();
    }

    @Override
    public Student save(Student student) {
        // Ensure student ID is set for new records
        if (student.getId() == null && (student.getStudentId() == null || student.getStudentId().isBlank())) {
            String generatedId = idGeneratorService.generateStudentId();
            student.setStudentId(generatedId);
        }

        // Set timestamps
        if (student.getId() == null) {
            student.setCreatedAt(LocalDate.now());
        }
        student.setUpdatedAt(LocalDate.now());

        return studentRepository.save(student);
    }

    @Override
    public List<Student> getStudentsByFilterFull(String nameSearch, String status) {
        boolean hasName = nameSearch != null && !nameSearch.isBlank();
        boolean hasStatus = status != null && !status.isBlank();

        if (hasName && hasStatus) {
            return studentRepository.findByStudentNameIgnoreCaseContainingAndStatus(nameSearch, status);
        } else if (hasName) {
            return studentRepository.findByStudentNameIgnoreCaseContaining(nameSearch);
        } else if (hasStatus) {
            return studentRepository.findByStatus(status);
        } else {
            return studentRepository.findAll();
        }
    }

    @Override
    public List<StudentDTO> getStudentsByStatuses(String nameSearch, List<String> statuses) {
        List<Student> students;
        boolean hasName = nameSearch != null && !nameSearch.isBlank();
        boolean hasStatuses = statuses != null && !statuses.isEmpty();

        if (hasName && hasStatuses) {
            students = studentRepository.findByStudentNameIgnoreCaseContainingAndStatusIn(nameSearch, statuses);
        } else if (hasName) {
            students = studentRepository.findByStudentNameIgnoreCaseContaining(nameSearch);
        } else if (hasStatuses) {
            students = studentRepository.findByStatusIn(statuses);
        } else {
            students = studentRepository.findAll();
        }

        students.sort((s1, s2) -> {
            String id1 = s1.getStudentId();
            String id2 = s2.getStudentId();

            if (id1 == null && id2 == null)
                return 0;
            if (id1 == null)
                return 1;
            if (id2 == null)
                return -1;

            try {
                String num1 = id1.replaceAll("[^0-9]", "");
                String num2 = id2.replaceAll("[^0-9]", "");
                if (!num1.isEmpty() && !num2.isEmpty()) {
                    return Integer.compare(Integer.parseInt(num1), Integer.parseInt(num2));
                }
            } catch (Exception e) {
                // Fallback to string comparison
            }
            return id1.compareTo(id2);
        });

        return students.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private Integer extractNumberFromStudentId(String studentId) {
        if (studentId == null || studentId.isEmpty()) {
            return 0;
        }

        try {
            String numericPart = studentId.replaceAll("[^0-9]", "");
            if (!numericPart.isEmpty()) {
                return Integer.parseInt(numericPart);
            }
        } catch (NumberFormatException e) {
        }

        return 0;
    }
}