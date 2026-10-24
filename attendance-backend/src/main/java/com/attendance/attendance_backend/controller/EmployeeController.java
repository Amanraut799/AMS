package com.attendance.attendance_backend.controller;

import com.attendance.attendance_backend.dto.EmployeeRegistrationResponse;
import com.attendance.attendance_backend.dto.EmployeeLoginProvisioningResponse;
import com.attendance.attendance_backend.entity.Employee;
import com.attendance.attendance_backend.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(
                employeeService.getAllEmployees()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                employeeService.getEmployeeById(id)
        );
    }

    @PostMapping
    public ResponseEntity<EmployeeRegistrationResponse> createEmployee(
            @RequestBody Employee employee
    ) {

        EmployeeRegistrationResponse response =
                employeeService.createEmployee(employee);

        return ResponseEntity.status(201)
                .body(response);
    }

    @PostMapping("/login-accounts/sync")
    public ResponseEntity<EmployeeLoginProvisioningResponse> createMissingLoginAccounts() {
        return ResponseEntity.ok(employeeService.createMissingLoginAccounts());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable Long id,
            @RequestBody Employee employee
    ) {
        return ResponseEntity.ok(
                employeeService.updateEmployee(id, employee)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(
            @PathVariable Long id
    ) {
        employeeService.deleteEmployee(id);

        return ResponseEntity.noContent().build();
    }
}
