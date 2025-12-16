package com.gicm.student_management_system.serviceimpl;

import com.gicm.student_management_system.dto.InterviewNotesDTO;
import com.gicm.student_management_system.entity.InterviewNotes;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.InterviewNotesRepository;
import com.gicm.student_management_system.repository.StudentRepository;
import com.gicm.student_management_system.service.InterviewNotesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InterviewNotesServiceImpl implements InterviewNotesService {

    private final InterviewNotesRepository interviewNotesRepository;
    private final StudentRepository studentRepository;

    // --- Converter Methods ---

    private InterviewNotesDTO convertToDTO(InterviewNotes entity) {
        if (entity == null) {
            return InterviewNotesDTO.builder().build();
        }
        return InterviewNotesDTO.builder()
                .id(entity.getId())
                .studentId(entity.getStudent() != null ? entity.getStudent().getId() : null)
                .interview1(entity.getInterview1())
                .interview2(entity.getInterview2())
                .interview3(entity.getInterview3())
                .otherMemo(entity.getOtherMemo())
                .build();
    }

    private void updateEntityFromDTO(InterviewNotes entity, InterviewNotesDTO dto) {
        entity.setInterview1(dto.getInterview1());
        entity.setInterview2(dto.getInterview2());
        entity.setInterview3(dto.getInterview3());
        entity.setOtherMemo(dto.getOtherMemo());
    }

    // --- Service Implementation ---

    @Override
    @Transactional(readOnly = true)
    public InterviewNotesDTO getOrCreateInterviewNotesDTO(Long studentId) {
        Optional<InterviewNotes> interviewNotesOpt = interviewNotesRepository.findByStudentId(studentId);

        if (interviewNotesOpt.isPresent()) {
            return convertToDTO(interviewNotesOpt.get());
        } else {
            return InterviewNotesDTO.builder()
                    .studentId(studentId)
                    .build();
        }
    }

    @Override
    @Transactional
    public void saveInterviewNotesDTO(Long studentId, InterviewNotesDTO interviewNotesDTO) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        InterviewNotes interviewNotes = interviewNotesRepository.findByStudentId(studentId)
                .orElse(InterviewNotes.builder().student(student).build());

        // Update fields
        updateEntityFromDTO(interviewNotes, interviewNotesDTO);

        // Ensure relationship is set
        interviewNotes.setStudent(student);

        interviewNotesRepository.save(interviewNotes);
    }
}