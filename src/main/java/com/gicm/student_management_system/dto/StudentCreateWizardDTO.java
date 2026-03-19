package com.gicm.student_management_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentCreateWizardDTO {
    private StudentDTO student;
    private AdditionalStudentInfoDTO additional;
}

