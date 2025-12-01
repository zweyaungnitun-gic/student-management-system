package com.gicm.student_management_system.service;

import com.gicm.student_management_system.dto.EmployeeListResponse;
import com.gicm.student_management_system.dto.EmployeeRequest;
import com.gicm.student_management_system.dto.EmployeeResponse;
import com.gicm.student_management_system.dto.EmployeeStats;

public interface EmployeeService {
    EmployeeListResponse getEmployeeSnapshot();

    EmployeeStats getEmployeeStats();

    EmployeeResponse getEmployee(Long id);

    EmployeeResponse createEmployee(EmployeeRequest request);

    EmployeeResponse updateEmployee(Long id, EmployeeRequest request);

    void deleteEmployee(Long id);
}


