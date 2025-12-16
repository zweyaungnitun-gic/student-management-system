package com.gicm.student_management_system.service;

import com.gicm.student_management_system.dto.InterviewNotesDTO;

public interface InterviewNotesService {
    InterviewNotesDTO getOrCreateInterviewNotesDTO(Long studentId);

    void saveInterviewNotesDTO(Long studentId, InterviewNotesDTO interviewNotesDTO);
}