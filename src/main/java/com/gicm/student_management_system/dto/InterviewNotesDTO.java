package com.gicm.student_management_system.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewNotesDTO {
    private Long id;
    private Long studentId;

    @Size(max = 500)
    private String interview1;

    @Size(max = 500)
    private String interview2;

    @Size(max = 500)
    private String interview3;

    @Size(max = 500)
    private String otherMemo;
}