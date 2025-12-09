package com.gicm.student_management_system.repository;

import com.gicm.student_management_system.entity.InterviewNotes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterviewNotesRepository extends JpaRepository<InterviewNotes, Long> {
    InterviewNotes findByStudentId(Long studentId);
}