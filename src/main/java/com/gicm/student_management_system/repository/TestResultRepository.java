package com.gicm.student_management_system.repository;

import com.gicm.student_management_system.entity.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestResultRepository extends JpaRepository<TestResult, Long> {
    
    @Query("SELECT tr FROM TestResult tr WHERE tr.test.testId = :testId ORDER BY tr.submittedAt DESC")
    List<TestResult> findByTestId(@Param("testId") Long testId);

    @Query("SELECT tr FROM TestResult tr WHERE tr.enrollment.student.id = :studentId")
    List<TestResult> findByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT tr FROM TestResult tr WHERE tr.enrollment.enrollmentId = :enrollmentId")
    List<TestResult> findByEnrollmentId(@Param("enrollmentId") Long enrollmentId);
    
    @Query("SELECT tr FROM TestResult tr WHERE tr.test.testId = :testId AND tr.enrollment.enrollmentId = :enrollmentId")
    Optional<TestResult> findByTestAndEnrollment(@Param("testId") Long testId, @Param("enrollmentId") Long enrollmentId);
    
    @Query("SELECT AVG(tr.scoreObtained) FROM TestResult tr WHERE tr.test.testId = :testId")
    Double getAverageScoreForTest(@Param("testId") Long testId);
    
    @Query("SELECT COUNT(tr) FROM TestResult tr WHERE tr.test.testId = :testId AND tr.scoreObtained >= tr.test.passingMarks")
    Long countPassedStudents(@Param("testId") Long testId);

     @Query("SELECT AVG(tr.scoreObtained) FROM TestResult tr WHERE tr.test.course.courseId = :courseId")
    Double findAverageScoreByCourseId(@Param("courseId") Long courseId);
}