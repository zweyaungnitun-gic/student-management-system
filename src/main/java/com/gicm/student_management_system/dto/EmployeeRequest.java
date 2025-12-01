package com.gicm.student_management_system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record EmployeeRequest(
        @NotBlank(message = "First name is required") String firstName,
        @NotBlank(message = "Last name is required") String lastName,
        @NotBlank(message = "Department is required") String department,
        @NotBlank(message = "Job title is required") String jobTitle,
        @NotBlank(message = "Status is required") String status,
        @Email @NotBlank(message = "Valid email is required") String email,
        @NotNull(message = "Salary is required") BigDecimal salary,
        LocalDate hireDate
) {
}


