package com.gicm.student_management_system.repository;

import com.gicm.student_management_system.entity.ReportCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportCardRepository extends JpaRepository<ReportCard, Long> {
    
    List<ReportCard> findByStudentIdOrderByGeneratedDateDesc(Long studentId);
    
    Optional<ReportCard> findByStudentIdAndAcademicYearAndSemester(
        Long studentId, String academicYear, String semester);
    
    @Query("SELECT rc FROM ReportCard rc WHERE rc.student.id = :studentId ORDER BY rc.generatedDate DESC")
    List<ReportCard> findLatestByStudentId(@Param("studentId") Long studentId);
    
    @Query("SELECT rc FROM ReportCard rc WHERE rc.student.id IN :studentIds AND rc.academicYear = :academicYear AND rc.semester = :semester")
    List<ReportCard> findByStudentIdsAndAcademicYearAndSemester(
        @Param("studentIds") List<Long> studentIds,
        @Param("academicYear") String academicYear,
        @Param("semester") String semester);
}