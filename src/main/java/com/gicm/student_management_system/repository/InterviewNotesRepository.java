package com.gicm.student_management_system.repository;

import com.gicm.student_management_system.entity.InterviewNotes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface InterviewNotesRepository extends JpaRepository<InterviewNotes, Long> {
    Optional<InterviewNotes> findByStudentId(Long studentId);
}
