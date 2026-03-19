package com.gicm.student_management_system.serviceimpl;

import com.gicm.student_management_system.dto.StudentDTO;
import com.gicm.student_management_system.entity.RegistrationStatus;
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

        return StudentDTO.builder()
                .id(student.getId())
                .studentId(student.getStudentId())
                .studentName(student.getStudentName())
                .dateOfBirth(student.getDateOfBirth())
                .gender(student.getGender())
                .religion(student.getReligion())
                .phoneNumber(student.getPhoneNumber())
                .currentLivingAddress(student.getCurrentLivingAddress())
                .homeTownAddress(student.getHomeTownAddress())
                .enrolledDate(student.getEnrolledDate())
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .nationalId(student.getNationalId())
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
        if (dto.getDateOfBirth() != null) {
            student.setDateOfBirth(dto.getDateOfBirth());
        }
        if (dto.getGender() != null) {
            student.setGender(dto.getGender());
        }

        if (dto.getPhoneNumber() != null) {
            student.setPhoneNumber(dto.getPhoneNumber());
        }
        if (dto.getCurrentLivingAddress() != null) {
            student.setCurrentLivingAddress(dto.getCurrentLivingAddress());
        }
        if (dto.getHomeTownAddress() != null) {
            student.setHomeTownAddress(dto.getHomeTownAddress());
        }

        if (dto.getReligion() != null) {
            student.setReligion(dto.getReligion());
        }

        if (dto.getEnrolledDate() != null) {
            student.setEnrolledDate(dto.getEnrolledDate());
        }
        if (dto.getNationalId() != null) {
            student.setNationalId(dto.getNationalId());
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
    public List<StudentDTO> getStudentsByFilter(String nameSearch) {
        List<Student> students;
        boolean hasName = nameSearch != null && !nameSearch.isBlank();

        if (hasName) {
            students = studentRepository.findByStudentNameIgnoreCaseContaining(nameSearch);
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
        if (dto.getNationalId() != null) {
            existing.setNationalId(dto.getNationalId());
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
    @Transactional
    public Student save(Student student) {
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
    public List<Student> getStudentsByFilterFull(String nameSearch) {
        boolean hasName = nameSearch != null && !nameSearch.isBlank();

        if (hasName) {
            return studentRepository.findByStudentNameIgnoreCaseContaining(nameSearch);
        } else {
            return studentRepository.findAll();
        }
    }

    @Override
    public boolean isNationalIdDuplicate(String nationalId, Long excludeId) {
        return studentRepository.findByNationalIdAndIdNot(nationalId, excludeId).isPresent();
    }

    @Override
    public List<Student> findByRegistrationStatus(RegistrationStatus status, String nameSearch) {
        if (nameSearch == null || nameSearch.isBlank()) {
            return studentRepository.findByRegistrationStatus(status);
        }
        return studentRepository.findByRegistrationStatusAndStudentNameIgnoreCaseContaining(status, nameSearch);
    }
}