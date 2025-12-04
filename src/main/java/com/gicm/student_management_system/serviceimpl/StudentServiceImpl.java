package com.gicm.student_management_system.serviceimpl;

import com.gicm.student_management_system.dto.StudentDTO;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.StudentRepository;
import com.gicm.student_management_system.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;

    private StudentDTO convertToDTO(Student student) {
        return StudentDTO.builder()
                .id(student.getId())
                .studentName(student.getStudentName())
                .gender(student.getGender())
                .phoneNumber(student.getPhoneNumber())
                .desiredJobType(student.getDesiredJobType())
                .status(student.getStatus())
                .paymentDueDate(student.getSchedulePaymentTutionDate())
                .paymentDate(student.getActualTutionPaymentDate())
                .build();
    }

    private Student convertToEntity(StudentDTO dto) {
        return Student.builder()
                .id(dto.getId())
                .studentName(dto.getStudentName())
                .gender(dto.getGender())
                .phoneNumber(dto.getPhoneNumber())
                .desiredJobType(dto.getDesiredJobType())
                .status(dto.getStatus())
                .schedulePaymentTutionDate(dto.getPaymentDueDate())
                .actualTutionPaymentDate(dto.getPaymentDate())
                .build();
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
        if (!nameSearch.isEmpty() && !status.isEmpty()) {
            students = studentRepository.findByStudentNameContainingAndStatus(nameSearch, status);
        } else if (!nameSearch.isEmpty()) {
            students = studentRepository.findByStudentNameContaining(nameSearch);
        } else if (!status.isEmpty()) {
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
    public StudentDTO createStudent(StudentDTO studentDTO) {
        Student saved = studentRepository.save(convertToEntity(studentDTO));
        return convertToDTO(saved);
    }

    @Override
    public StudentDTO updateStudent(Long id, StudentDTO studentDTO) {
        return studentRepository.findById(id)
                .map(existing -> {
                    existing.setStudentName(studentDTO.getStudentName());
                    existing.setGender(studentDTO.getGender());
                    existing.setPhoneNumber(studentDTO.getPhoneNumber());
                    existing.setDesiredJobType(studentDTO.getDesiredJobType());
                    existing.setStatus(studentDTO.getStatus());
                    existing.setSchedulePaymentTutionDate(studentDTO.getPaymentDueDate());
                    existing.setActualTutionPaymentDate(studentDTO.getPaymentDate());
                    Student updated = studentRepository.save(existing);
                    return convertToDTO(updated);
                }).orElse(null);
    }

    @Override
    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }
}
