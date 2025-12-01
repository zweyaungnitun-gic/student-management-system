package com.gicm.student_management_system.serviceimpl;

import com.gicm.student_management_system.dto.EmployeeListResponse;
import com.gicm.student_management_system.dto.EmployeeRequest;
import com.gicm.student_management_system.dto.EmployeeResponse;
import com.gicm.student_management_system.dto.EmployeeStats;
import com.gicm.student_management_system.entity.Employee;
import com.gicm.student_management_system.repository.EmployeeRepository;
import com.gicm.student_management_system.service.EmployeeService;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private static final String EMPLOYEE_COLLECTION_KEY = "employees:collection";
    private static final String EMPLOYEE_STATS_KEY = "employees:stats";

    private final EmployeeRepository employeeRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository, RedisTemplate<String, Object> redisTemplate) {
        this.employeeRepository = employeeRepository;
        this.redisTemplate = redisTemplate;
    }

    @Override
    public EmployeeListResponse getEmployeeSnapshot() {
        ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();

        EmployeeListResponse cached = (EmployeeListResponse) valueOperations.get(EMPLOYEE_COLLECTION_KEY);
        if (cached != null) {
            EmployeeStats statsFromCache = cached.stats().withSource("redis");
            return new EmployeeListResponse(cached.employees(), statsFromCache);
        }

        List<Employee> employees = employeeRepository.findAll().stream()
                .sorted(Comparator.comparing(Employee::getLastName).thenComparing(Employee::getFirstName))
                .toList();
        EmployeeListResponse response = new EmployeeListResponse(
                employees.stream().map(this::toResponse).collect(Collectors.toList()),
                buildStats(employees, "database"));

        valueOperations.set(EMPLOYEE_COLLECTION_KEY, response);
        valueOperations.set(EMPLOYEE_STATS_KEY, response.stats());
        cacheIndividuals(response.employees());

        return response;
    }

    @Override
    public EmployeeStats getEmployeeStats() {
        ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();
        EmployeeStats cached = (EmployeeStats) valueOperations.get(EMPLOYEE_STATS_KEY);
        if (cached != null) {
            return cached.withSource("redis");
        }

        long total = employeeRepository.count();
        long active = employeeRepository.countByStatusIgnoreCase("ACTIVE");
        EmployeeStats stats = new EmployeeStats(total, active, "database", Instant.now());
        valueOperations.set(EMPLOYEE_STATS_KEY, stats);
        return stats;
    }

    @Override
    public EmployeeResponse getEmployee(Long id) {
        String cacheKey = employeeCacheKey(id);
        ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();
        EmployeeResponse cached = (EmployeeResponse) valueOperations.get(cacheKey);
        if (cached != null) {
            return cached;
        }

        Employee employee = employeeRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id " + id));
        EmployeeResponse response = toResponse(employee);
        valueOperations.set(cacheKey, response);
        return response;
    }

    @Override
    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        ensureEmailUnique(request.email(), null);

        Employee employee = new Employee();
        applyRequest(employee, request);
        Employee saved = employeeRepository.save(employee);
        EmployeeResponse response = toResponse(saved);
        cacheAfterMutation(response);
        return response;
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = employeeRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id " + id));

        ensureEmailUnique(request.email(), id);
        applyRequest(employee, request);

        Employee saved = employeeRepository.save(employee);
        EmployeeResponse response = toResponse(saved);
        cacheAfterMutation(response);
        return response;
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new IllegalArgumentException("Employee not found with id " + id);
        }

        employeeRepository.deleteById(id);
        redisTemplate.delete(employeeCacheKey(id));
        redisTemplate.delete(EMPLOYEE_COLLECTION_KEY);
        redisTemplate.delete(EMPLOYEE_STATS_KEY);
    }

    private void cacheAfterMutation(EmployeeResponse response) {
        ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();
        valueOperations.set(employeeCacheKey(response.id()), response);
        redisTemplate.delete(EMPLOYEE_COLLECTION_KEY);
        redisTemplate.delete(EMPLOYEE_STATS_KEY);
    }

    private void cacheIndividuals(List<EmployeeResponse> employees) {
        ValueOperations<String, Object> valueOperations = redisTemplate.opsForValue();
        employees.forEach(employee -> valueOperations.set(employeeCacheKey(employee.id()), employee));
    }

    private EmployeeStats buildStats(List<Employee> employees, String source) {
        long total = employees.size();
        long active = employees.stream().filter(emp -> "ACTIVE".equalsIgnoreCase(emp.getStatus())).count();
        return new EmployeeStats(total, active, source, Instant.now());
    }

    private String employeeCacheKey(Long id) {
        return "employees:item:" + id;
    }

    private EmployeeResponse toResponse(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getDepartment(),
                employee.getJobTitle(),
                employee.getStatus(),
                employee.getEmail(),
                employee.getSalary(),
                employee.getHireDate(),
                employee.getUpdatedAt());
    }

    private void applyRequest(Employee employee, EmployeeRequest request) {
        employee.setFirstName(request.firstName());
        employee.setLastName(request.lastName());
        employee.setDepartment(request.department());
        employee.setJobTitle(request.jobTitle());
        employee.setStatus(request.status().toUpperCase());
        employee.setEmail(request.email().toLowerCase());
        employee.setSalary(Optional.ofNullable(request.salary()).orElse(BigDecimal.ZERO));
        employee.setHireDate(Optional.ofNullable(request.hireDate()).orElse(LocalDate.now()));
    }

    private void ensureEmailUnique(String email, Long currentId) {
        employeeRepository
                .findByEmailIgnoreCase(email)
                .ifPresent(existing -> {
                    if (currentId == null || !existing.getId().equals(currentId)) {
                        throw new DataIntegrityViolationException("Email is already registered for another employee");
                    }
                });
    }
}


