package com.gicm.student_management_system.serviceimpl;

import com.gicm.student_management_system.entity.InterviewNotes;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.InterviewNotesRepository;
import com.gicm.student_management_system.repository.StudentRepository;
import com.gicm.student_management_system.dto.InterviewNotesDTO; 
import com.gicm.student_management_system.service.InterviewNotesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InterviewNotesServiceImpl implements InterviewNotesService {

    private final InterviewNotesRepository interviewNotesRepository;
    private final StudentRepository studentRepository;

    @Override
    @Transactional
    public InterviewNotes getOrCreateInterviewNotes(Long studentId) {
        InterviewNotes existing = interviewNotesRepository.findByStudentId(studentId);
        if (existing != null) {
            return existing;
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid student Id: " + studentId));

        InterviewNotes newNotes = InterviewNotes.builder()
                .student(student)
                .build();

        return interviewNotesRepository.save(newNotes);
    }

    // Implementation for DTO
    @Override
    @Transactional
    public InterviewNotesDTO getOrCreateInterviewNotesDTO(Long studentId) {
        // Reuse the existing logic to get or create the entity
        InterviewNotes entity = getOrCreateInterviewNotes(studentId);
        
        // Map Entity to DTO
        return InterviewNotesDTO.builder()
                .id(entity.getId())
                .studentId(entity.getStudent().getId())
                .interview1(entity.getInterview1())
                .interview2(entity.getInterview2())
                .interview3(entity.getInterview3())
                .otherMemo(entity.getOtherMemo())
                .build();
    }

    @Override
    @Transactional
    public InterviewNotes saveInterviewNotes(InterviewNotes interviewNotes) {
        return interviewNotesRepository.save(interviewNotes);
    }
}