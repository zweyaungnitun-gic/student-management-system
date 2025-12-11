package com.gicm.student_management_system.service;

import com.gicm.student_management_system.entity.InterviewNotes;
import com.gicm.student_management_system.dto.InterviewNotesDTO;
import com.gicm.student_management_system.entity.Student;

public interface InterviewNotesService {
    InterviewNotes getOrCreateInterviewNotes(Long studentId);

    InterviewNotes saveInterviewNotes(InterviewNotes interviewNotes);

    InterviewNotesDTO getOrCreateInterviewNotesDTO(Long studentId);
}