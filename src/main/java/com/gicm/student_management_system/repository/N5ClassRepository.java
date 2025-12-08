package com.gicm.student_management_system.repository;

import com.gicm.student_management_system.entity.N5Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface N5ClassRepository extends JpaRepository<N5Class, Long> {
    
    Optional<N5Class> findByStudentId(Long studentId);
}