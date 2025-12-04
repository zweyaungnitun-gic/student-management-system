package com.gicm.student_management_system.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDTO {

    private Long id;
    private String studentName;
    private String gender;
    private String phoneNumber;
    private String desiredJobType;
    private String status;
    private LocalDate paymentDueDate;  
    private LocalDate paymentDate;     
}
