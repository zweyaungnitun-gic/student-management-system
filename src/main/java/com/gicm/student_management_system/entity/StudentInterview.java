package com.gicm.student_management_system.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "student_interview")
@Getter
@Setter
@NoArgsConstructor
public class StudentInterview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "student_id")
    private Student student;

    @Column(name = "interview_1", columnDefinition = "text")
    private String interview1;

    @Column(name = "interview_2", columnDefinition = "text")
    private String interview2;

    @Column(name = "interview_3", columnDefinition = "text")
    private String interview3;

    @Column(name = "other_memo", columnDefinition = "text")
    private String otherMemo;
}
