package com.gicm.student_management_system.dto;

import lombok.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Getter
@Setter
@Data
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