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
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;

    private StudentDTO convertToDTO(Student s) {
        if (s == null)
            return null;
        return StudentDTO.builder()
                .id(s.getId())
                .studentName(s.getStudentName())
                .gender(s.getGender())
                .phoneNumber(s.getPhoneNumber())
                .desiredJobType(s.getDesiredJobType())
                .status(s.getStatus())
                .paymentDueDate(s.getSchedulePaymentTutionDate())
                .paymentDate(s.getActualTutionPaymentDate())
                .build();
    }

    private Student convertToEntity(StudentDTO dto, Student existing) {
        Student s = existing == null ? new Student() : existing;
        s.setStudentName(dto.getStudentName());
        s.setGender(dto.getGender());
        s.setPhoneNumber(dto.getPhoneNumber());
        s.setDesiredJobType(dto.getDesiredJobType());
        s.setStatus(dto.getStatus());
        s.setSchedulePaymentTutionDate(dto.getPaymentDueDate());
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
            students = studentRepository.findByStudentNameContainingAndStatus(nameSearch, status);
        } else if (hasName) {
            students = studentRepository.findByStudentNameContaining(nameSearch);
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
        Student toSave = convertToEntity(dto, null);
        Student saved = studentRepository.save(toSave);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public StudentDTO updateStudent(Long id, StudentDTO dto) {
        Optional<Student> opt = studentRepository.findById(id);
        if (opt.isEmpty())
            return null;
        Student updated = convertToEntity(dto, opt.get());
        Student saved = studentRepository.save(updated);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }

    public List<Student> findAllEntities() {
        return studentRepository.findAll();
    }

    public Optional<Student> findByIdEntity(Long id) {
        return studentRepository.findById(id);
    }

    @Transactional
    public Student saveEntity(Student student) {
        return studentRepository.save(student);
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
}
