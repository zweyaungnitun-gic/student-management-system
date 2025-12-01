package com.gicm.student_management_system.repository;

import com.gicm.student_management_system.entity.Employee;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmailIgnoreCase(String email);

    long countByStatusIgnoreCase(String status);
}


