package com.gicm.student_management_system.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "enrollments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "enrollment_id")
    private Long enrollmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", referencedColumnName = "id")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", referencedColumnName = "course_id")
    private Course course;

    @Column(name = "semester")
    private String semester;

    @Column(name = "status")
    private String status; // pending, enrolled, completed, dropped, failed

    @Column(name = "initiated_by")
    private String initiatedBy; // student, admin

    @Column(name = "enrollment_request_date")
    private LocalDateTime enrollmentRequestDate;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        enrollmentRequestDate = LocalDateTime.now();
        if (status == null) {
            status = "pending";
        }
    }

    // Reverse relationship (TestResult -> Enrollment)
    @OneToMany(mappedBy = "enrollment", fetch = FetchType.LAZY)
    private List<TestResult> testResults;
}