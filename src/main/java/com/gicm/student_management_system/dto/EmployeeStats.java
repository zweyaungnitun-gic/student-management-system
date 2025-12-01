package com.gicm.student_management_system.dto;

import java.time.Instant;

public record EmployeeStats(long totalEmployees, long activeEmployees, String source, Instant snapshotTime) {

    public EmployeeStats withSource(String newSource) {
        return new EmployeeStats(totalEmployees, activeEmployees, newSource, snapshotTime);
    }
}


