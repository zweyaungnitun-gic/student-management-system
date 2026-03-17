package com.gicm.student_management_system.serviceimpl;

import com.gicm.student_management_system.dto.TeacherDTO;
import com.gicm.student_management_system.entity.Teacher;
import com.gicm.student_management_system.repository.TeacherRepository;
import com.gicm.student_management_system.service.TeacherService;
import com.gicm.student_management_system.service.TeacherIdGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherServiceImpl implements TeacherService {

    private final TeacherRepository teacherRepository;
    private final TeacherIdGeneratorService teacherIdGeneratorService;

    private TeacherDTO convertToDTO(Teacher teacher) {
        if (teacher == null) return null;
        return TeacherDTO.builder()
                .teacherId(teacher.getTeacherId())
                .teacherCode(teacher.getTeacherCode())  // Add this
                .name(teacher.getName())
                .email(teacher.getEmail())
                .department(teacher.getDepartment())
                .createdAt(teacher.getCreatedAt())
                .build();
    }

    private Teacher convertToEntity(TeacherDTO dto) {
        return convertToEntity(dto, null);
    }

    private Teacher convertToEntity(TeacherDTO dto, Teacher existing) {
        Teacher teacher = (existing != null) ? existing : new Teacher();

        if (dto.getName() != null) teacher.setName(dto.getName());
        if (dto.getEmail() != null) teacher.setEmail(dto.getEmail());
        if (dto.getDepartment() != null) teacher.setDepartment(dto.getDepartment());
        
        // Don't overwrite existing teacherCode when updating
        if (existing == null && dto.getTeacherCode() == null) {
            teacher.setTeacherCode(teacherIdGeneratorService.generateTeacherId());
        } else if (dto.getTeacherCode() != null) {
            teacher.setTeacherCode(dto.getTeacherCode());
        }

        return teacher;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeacherDTO> getAllTeachers() {
        return teacherRepository.findAll().stream()
                .map(this::convertToDTO)
                .sorted((t1, t2) -> {
                    // Sort by teacherCode (TCH001, TCH002, etc.)
                    String code1 = t1.getTeacherCode() != null ? t1.getTeacherCode() : "";
                    String code2 = t2.getTeacherCode() != null ? t2.getTeacherCode() : "";
                    
                    // Extract numeric part for numerical sorting
                    try {
                        int num1 = extractNumberFromCode(code1);
                        int num2 = extractNumberFromCode(code2);
                        return Integer.compare(num1, num2);
                    } catch (Exception e) {
                        return code1.compareTo(code2);
                    }
                })
                .collect(Collectors.toList());
    }

    private int extractNumberFromCode(String code) {
        if (code == null || code.isEmpty()) return 0;
        String numericPart = code.replaceAll("[^0-9]", "");
        if (numericPart.isEmpty()) return 0;
        return Integer.parseInt(numericPart);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TeacherDTO> getTeacherById(Long id) {
        return teacherRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TeacherDTO> getTeacherByEmail(String email) {
        return teacherRepository.findByEmail(email)
                .map(this::convertToDTO);
    }

    @Override
    @Transactional
    public TeacherDTO createTeacher(TeacherDTO teacherDTO) {
        if (teacherRepository.existsByEmail(teacherDTO.getEmail())) {
            throw new RuntimeException("このメールアドレスは既に登録されています");
        }

        Teacher teacher = convertToEntity(teacherDTO);
        Teacher saved = teacherRepository.save(teacher);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public TeacherDTO updateTeacher(Long id, TeacherDTO teacherDTO) {
        Teacher existing = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("教師が見つかりません: " + id));

        // Check email uniqueness if changed
        if (!existing.getEmail().equals(teacherDTO.getEmail()) && 
            teacherRepository.existsByEmail(teacherDTO.getEmail())) {
            throw new RuntimeException("このメールアドレスは既に使用されています");
        }

        Teacher updated = convertToEntity(teacherDTO, existing);
        Teacher saved = teacherRepository.save(updated);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public void deleteTeacher(Long id) {
        if (!teacherRepository.existsById(id)) {
            throw new RuntimeException("教師が見つかりません: " + id);
        }
        teacherRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return teacherRepository.existsByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeacherDTO> searchTeachers(String search) {
        if (search == null || search.isEmpty()) {
            return getAllTeachers();
        }
        
        String searchLower = search.toLowerCase();
        return teacherRepository.findByNameContainingIgnoreCase(search).stream()
                .map(this::convertToDTO)
                .filter(teacher -> 
                    teacher.getName() != null && teacher.getName().toLowerCase().contains(searchLower) ||
                    teacher.getEmail() != null && teacher.getEmail().toLowerCase().contains(searchLower) ||
                    teacher.getTeacherCode() != null && teacher.getTeacherCode().toLowerCase().contains(searchLower))
                .sorted((t1, t2) -> {
                    String code1 = t1.getTeacherCode() != null ? t1.getTeacherCode() : "";
                    String code2 = t2.getTeacherCode() != null ? t2.getTeacherCode() : "";
                    try {
                        int num1 = extractNumberFromCode(code1);
                        int num2 = extractNumberFromCode(code2);
                        return Integer.compare(num1, num2);
                    } catch (Exception e) {
                        return code1.compareTo(code2);
                    }
                })
                .collect(Collectors.toList());
    }
}