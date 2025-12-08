package com.gicm.student_management_system.repository;

import com.gicm.student_management_system.entity.N4Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface N4ClassRepository extends JpaRepository<N4Class, Long> {

    Optional<N4Class> findByStudentId(Long studentId);
}