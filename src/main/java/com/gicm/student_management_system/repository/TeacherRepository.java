package com.gicm.student_management_system.repository;

import com.gicm.student_management_system.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Teacher> findByNameContainingIgnoreCase(String name);
    
    Optional<Teacher> findByTeacherCode(String teacherCode);
    boolean existsByTeacherCode(String teacherCode);
    
    List<Teacher> findByIsActiveTrue();
    
    @Query("SELECT t FROM Teacher t WHERE t.isActive = true AND " +
           "(LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.teacherCode) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Teacher> searchActiveTeachers(@Param("search") String search);
    
    @Query("SELECT t FROM Teacher t WHERE " +
           "(LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.teacherCode) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Teacher> searchAllTeachers(@Param("search") String search);
}