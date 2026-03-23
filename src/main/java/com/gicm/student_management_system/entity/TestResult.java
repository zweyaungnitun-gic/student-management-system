package com.gicm.student_management_system.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "test_result_id")
    private Long testResultId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    private Test test;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @Column(name = "score_obtained", precision = 5, scale = 2)
    private BigDecimal scoreObtained;

    @Column(name = "grade", length = 2)
    private String grade;

    @Column(name = "gpa", precision = 3, scale = 2)
    private BigDecimal gpa;

    @Column(name = "percentage")
    private Double percentage;

    @Column(name = "result", length = 10)
    private String result;

    @Column(name = "teacher_feedback", length = 1000)
    private String teacherFeedback;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graded_by", referencedColumnName = "teacher_id")
    private Teacher gradedBy;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "graded_at")
    private LocalDateTime gradedAt;

    @PrePersist
    @PreUpdate
    protected void calculateGradeAndGpa() {
        if (scoreObtained != null && test != null && test.getTotalMarks() != null && test.getTotalMarks() > 0) {
            // Calculate percentage
            this.percentage = (scoreObtained.doubleValue() / test.getTotalMarks()) * 100;
            
            // Set result based on passing marks
            if (test.getPassingMarks() != null) {
                this.result = scoreObtained.compareTo(BigDecimal.valueOf(test.getPassingMarks())) >= 0 ? "PASS" : "FAIL";
            }
            
            // Calculate grade and GPA based on percentage
            if (percentage >= 90) {
                this.grade = "A+";
                this.gpa = BigDecimal.valueOf(4.0);
            } else if (percentage >= 80) {
                this.grade = "A";
                this.gpa = BigDecimal.valueOf(4.0);
            } else if (percentage >= 75) {
                this.grade = "B+";
                this.gpa = BigDecimal.valueOf(3.5);
            } else if (percentage >= 70) {
                this.grade = "B";
                this.gpa = BigDecimal.valueOf(3.0);
            } else if (percentage >= 65) {
                this.grade = "C+";
                this.gpa = BigDecimal.valueOf(2.5);
            } else if (percentage >= 60) {
                this.grade = "C";
                this.gpa = BigDecimal.valueOf(2.0);
            } else if (percentage >= 55) {
                this.grade = "D+";
                this.gpa = BigDecimal.valueOf(1.5);
            } else if (percentage >= 50) {
                this.grade = "D";
                this.gpa = BigDecimal.valueOf(1.0);
            } else {
                this.grade = "F";
                this.gpa = BigDecimal.valueOf(0.0);
            }
        }
    }
}