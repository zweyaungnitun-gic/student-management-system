package com.gicm.student_management_system.serviceimpl;

import com.gicm.student_management_system.dto.StudentDTO;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.StudentRepository;
import com.gicm.student_management_system.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;

    public StudentServiceImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public StudentDTO convertToDTO(Student student) {
        return StudentDTO.builder()
                .id(student.getId())
                .studentId(student.getStudentId())
                .studentName(student.getStudentName())
                .nameInJapanese(student.getNameInJapanese())
                .dateOfBirth(student.getDateOfBirth())
                .gender(student.getGender())
                .religion(student.getReligion()) // Fix for religious field
                .otherReligion(student.getOtherReligion())
                .nationalID(student.getNationalID()) // Fix for National ID
                .passportNumber(student.getPassportNumber())
                .fatherName(student.getFatherName())
                .currentJapanLevel(student.getCurrentJapanLevel())
                .passedHighestJLPTLevel(student.getPassedHighestJLPTLevel())
                .desiredJobType(student.getDesiredJobType())
                .otherDesiredJobType(student.getOtherDesiredJobType())
                .isSmoking(student.getIsSmoking()) // Correct Boolean binding
                .isAlcoholDrink(student.getIsAlcoholDrink())
                .haveTatto(student.getHaveTatto())
                .hostelPreference(student.getHostelPreference())
                .japanTravelExperience(student.getJapanTravelExperience())
                .coeApplicationExperience(student.getCoeApplicationExperience())
                .memoNotes(student.getMemoNotes())
                // Contact Info
                .phoneNumber(student.getPhoneNumber())
                .secondaryPhone(student.getSecondaryPhone())
                .contactViber(student.getContactViber())
                .currentLivingAddress(student.getCurrentLivingAddress())
                .homeTownAddress(student.getHomeTownAddress())
                // Academic Info
                .status(student.getStatus()) // Student Status binding
                .enrolledDate(student.getEnrolledDate())
                .schedulePaymentTutionDate(student.getSchedulePaymentTutionDate())
                .actualTutionPaymentDate(student.getActualTutionPaymentDate())
                // Populate the short-form names
                .paymentDueDate(student.getSchedulePaymentTutionDate()) // Map from entity
                .paymentDate(student.getActualTutionPaymentDate())
                .build();
    }

    private Student convertToEntity(StudentDTO dto, Student existing) {
        Student s = existing == null ? new Student() : existing;

        if (dto.getStudentName() != null)
            s.setStudentName(dto.getStudentName());

        if (dto.getGender() != null)
            s.setGender(dto.getGender());

        if (dto.getPhoneNumber() != null)
            s.setPhoneNumber(dto.getPhoneNumber());

        if (dto.getDesiredJobType() != null) {
            // Check if the text is already proper Japanese
            String jobType = dto.getDesiredJobType();
            // If it's coming as romaji, you may need to map it back
            // But first, let's ensure the encoding is correct
            s.setDesiredJobType(jobType);
        }

        if (dto.getStatus() != null)
            s.setStatus(dto.getStatus());

        if (dto.getPaymentDueDate() != null)
            s.setSchedulePaymentTutionDate(dto.getPaymentDueDate());

        if (dto.getPaymentDate() != null)
            s.setActualTutionPaymentDate(dto.getPaymentDate());

        return s;
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

        return students.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public StudentDTO getStudentById(Long id) {
        return studentRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Override
    @Transactional
    public StudentDTO createStudent(StudentDTO dto) {
        Student saved = studentRepository.save(convertToEntity(dto, null));
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public StudentDTO updateStudent(Long id, StudentDTO dto) {
        Optional<Student> opt = studentRepository.findById(id);
        if (opt.isEmpty())
            return null;
        Student saved = studentRepository.save(convertToEntity(dto, opt.get()));
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
    public Optional<Student> findById(Long id) {
        return studentRepository.findById(id);
    }

    @Override
    public Student save(Student student) {
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

        // FIX: Sort by student ID at the service level
        students.sort((s1, s2) -> {
            if (s1.getStudentId() == null && s2.getStudentId() == null)
                return 0;
            if (s1.getStudentId() == null)
                return 1;
            if (s2.getStudentId() == null)
                return -1;

            // Extract numbers for proper numeric sorting
            try {
                String num1 = s1.getStudentId().replaceAll("[^0-9]", "");
                String num2 = s2.getStudentId().replaceAll("[^0-9]", "");
                if (!num1.isEmpty() && !num2.isEmpty()) {
                    return Integer.compare(Integer.parseInt(num1), Integer.parseInt(num2));
                }
            } catch (Exception e) {
                // Fallback to string comparison
            }
            return s1.getStudentId().compareTo(s2.getStudentId());
        });

        return students.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}