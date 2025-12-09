package com.gicm.student_management_system.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_notes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewNotes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", referencedColumnName = "id")
    private Student student;

    @Column(name = "interview_1", length = 2000)
    private String interview1;

    @Column(name = "interview_2", length = 2000)
    private String interview2;

    @Column(name = "interview_3", length = 2000)
    private String interview3;

    @Column(name = "other_memo", length = 4000)
    private String otherMemo;
}