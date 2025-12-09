package com.gicm.student_management_system.repository;

import com.gicm.student_management_system.entity.StudentInterview;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewNotesRepository extends JpaRepository<StudentInterview, Long> {
}
