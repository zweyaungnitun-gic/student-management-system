package com.gicm.student_management_system.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "report_cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "academic_year", length = 10)
    private String academicYear;

    @Column(name = "semester", length = 10)
    private String semester;

    @Column(name = "generated_date")
    private LocalDateTime generatedDate;

    @Column(name = "semester_gpa", precision = 3, scale = 2)
    private BigDecimal semesterGPA;

    @Column(name = "cumulative_gpa", precision = 3, scale = 2)
    private BigDecimal cumulativeGPA;

    @Column(name = "total_credits")
    private Integer totalCredits;

    @Column(name = "total_courses")
    private Integer totalCourses;

    @Column(name = "passed_courses")
    private Integer passedCourses;

    @Column(name = "failed_courses")
    private Integer failedCourses;

    @Column(name = "class_rank")
    private Integer classRank;

    @Column(name = "total_students")
    private Integer totalStudents;

    @Column(name = "academic_standing", length = 20)
    private String academicStanding;

    @Column(name = "principal_remarks", length = 500)
    private String principalRemarks;

    @Column(name = "class_teacher_remarks", length = 500)
    private String classTeacherRemarks;

    @Column(name = "report_data", columnDefinition = "TEXT") 
    private String reportData;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (generatedDate == null) {
            generatedDate = LocalDateTime.now();
        }
    }
}