package com.gicm.student_management_system.serviceimpl;

import com.gicm.student_management_system.entity.InterviewNotes;
import com.gicm.student_management_system.entity.Student;
import com.gicm.student_management_system.repository.InterviewNotesRepository;
import com.gicm.student_management_system.repository.StudentRepository;
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

    @Override
    @Transactional
    public InterviewNotes saveInterviewNotes(InterviewNotes interviewNotes) {
        return interviewNotesRepository.save(interviewNotes);
    }
}