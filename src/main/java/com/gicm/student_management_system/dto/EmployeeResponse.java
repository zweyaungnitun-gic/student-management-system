package com.gicm.student_management_system.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record EmployeeResponse(
        Long id,
        String firstName,
        String lastName,
        String department,
        String jobTitle,
        String status,
        String email,
        BigDecimal salary,
        LocalDate hireDate,
        OffsetDateTime updatedAt
) {
}


