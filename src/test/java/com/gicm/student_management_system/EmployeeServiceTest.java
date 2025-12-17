package com.gicm.student_management_system;

import com.gicm.student_management_system.dto.EmployeeRequest;
import com.gicm.student_management_system.dto.EmployeeResponse;
import com.gicm.student_management_system.entity.Employee;
import com.gicm.student_management_system.repository.EmployeeRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.gicm.student_management_system.serviceimpl.EmployeeServiceImpl;

class EmployeeServiceImplTest {

    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private RedisTemplate<String, Object> redisTemplate;
    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void testCreateEmployee() {
        EmployeeRequest request = new EmployeeRequest(
                "John", "Doe", "IT", "Developer", "ACTIVE", "john.doe@example.com", BigDecimal.valueOf(5000), LocalDate.now()
        );
        Employee employee = new Employee();
        employee.setId(1L);
        employee.setFirstName("John");
        employee.setLastName("Doe");
        employee.setDepartment("IT");
        employee.setJobTitle("Developer");
        employee.setStatus("ACTIVE");
        employee.setEmail("john.doe@example.com");
        employee.setSalary(BigDecimal.valueOf(5000));
        employee.setHireDate(LocalDate.now());

        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        EmployeeResponse response = employeeService.createEmployee(request);

        assertNotNull(response);
        assertEquals("John", response.firstName());
        assertEquals("Doe", response.lastName());
        verify(employeeRepository, times(1)).save(any(Employee.class));
    }

    @Test
    void testGetEmployee() {
        Employee employee = new Employee();
        employee.setId(1L);
        employee.setFirstName("Jane");
        employee.setLastName("Smith");
        employee.setDepartment("HR");
        employee.setJobTitle("Manager");
        employee.setStatus("ACTIVE");
        employee.setEmail("jane.smith@example.com");
        employee.setSalary(BigDecimal.valueOf(6000));
        employee.setHireDate(LocalDate.now());

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        EmployeeResponse response = employeeService.getEmployee(1L);

        assertNotNull(response);
        assertEquals("Jane", response.firstName());
        assertEquals("Smith", response.lastName());
        verify(employeeRepository, times(1)).findById(1L);
    }
}