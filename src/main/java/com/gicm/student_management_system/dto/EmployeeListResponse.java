package com.gicm.student_management_system.dto;

import java.util.List;

public record EmployeeListResponse(List<EmployeeResponse> employees, EmployeeStats stats) {
}


