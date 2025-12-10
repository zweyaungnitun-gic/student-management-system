package com.gicm.student_management_system.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewNotesDTO {
    private Long id;
    private Long studentId;
    private String interview1;
    private String interview2;
    private String interview3;
    private String otherMemo;
}