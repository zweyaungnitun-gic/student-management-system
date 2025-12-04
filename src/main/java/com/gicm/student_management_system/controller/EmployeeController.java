package com.gicm.student_management_system.controller;

import com.gicm.student_management_system.dto.EmployeeListResponse;
import com.gicm.student_management_system.dto.EmployeeRequest;
import com.gicm.student_management_system.dto.EmployeeResponse;
import com.gicm.student_management_system.dto.EmployeeStats;
import com.gicm.student_management_system.entity.Employee;
import com.gicm.student_management_system.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    public String listEmployees(Model model) {
        EmployeeListResponse response = employeeService.getEmployeeSnapshot();
        EmployeeStats stats = employeeService.getEmployeeStats();
        model.addAttribute("employees", response.employees());
        model.addAttribute("employeeStats", stats);
        model.addAttribute("currentPage", "employees");
        model.addAttribute("pageTitle", "Employee Management");
        model.addAttribute("pageSubtitle", "People Operations");
        return "employees/list";
    }

    @GetMapping("/api")
    @ResponseBody
    public EmployeeListResponse listEmployeesApi() {
        return employeeService.getEmployeeSnapshot();
    }

    @GetMapping("/create")
    public String createEmployeeForm(Model model) {
        model.addAttribute("employee", new Employee()); // your DTO/command object
        model.addAttribute("currentPage", "employees");
        model.addAttribute("pageTitle", "Add Employee");
        return "employees/employee-create";
    }

    @GetMapping("/api/{id}")
    @ResponseBody
    public EmployeeResponse getEmployee(@PathVariable Long id) {
        return employeeService.getEmployee(id);
    }

    @PostMapping("/api")
    @ResponseBody
    public ResponseEntity<EmployeeResponse> createEmployee(@Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse created = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/api/{id}")
    @ResponseBody
    public EmployeeResponse updateEmployee(@PathVariable Long id, @Valid @RequestBody EmployeeRequest request) {
        return employeeService.updateEmployee(id, request);
    }

    @DeleteMapping("/api/{id}")
    @ResponseBody
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/update")
    public String showUpdateEmployeePage(Model model) {
        return "employees/update";
    }

    @GetMapping("/details")
    public String showEmployeeDetails(
        @RequestParam(required =false, defaultValue = "personal")String tab,
        @RequestParam(required = false)String subTab,
        Model model) {
        model.addAttribute("currentTab", tab);
        model.addAttribute("currentSubTab", subTab);
        return "employees/details";  
    // templates/employees/details.html
    }
}