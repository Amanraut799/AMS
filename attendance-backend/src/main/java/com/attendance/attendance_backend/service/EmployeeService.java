package com.attendance.attendance_backend.service;

import com.attendance.attendance_backend.entity.Employee;
import com.attendance.attendance_backend.entity.Role;
import com.attendance.attendance_backend.entity.User;
import com.attendance.attendance_backend.repository.EmployeeRepository;
import com.attendance.attendance_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.attendance.attendance_backend.dto.EmployeeRegistrationResponse;
import com.attendance.attendance_backend.dto.EmployeeLoginProvisioningResponse;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Base64;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    public EmployeeService(
            EmployeeRepository employeeRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found with id: " + id
                        )
                );
    }

    @Transactional
    public EmployeeRegistrationResponse createEmployee(Employee employee) {

        validateEmployeeType(employee.getEmployeeType());

        // Check employee email
        if (employeeRepository.existsByEmail(employee.getEmail())) {
            throw new RuntimeException(
                    "Employee email already exists"
            );
        }

        // Check login email
        if (userRepository.findByEmail(employee.getEmail()).isPresent()) {
            throw new RuntimeException(
                    "Login account already exists for this email"
            );
        }

        // Generate employee code automatically
        long nextNumber = employeeRepository.count() + 1;

        String employeeCode = String.format(
                "EMP%03d",
                nextNumber
        );

        // Make sure employee code is unique
        while (employeeRepository.existsByEmployeeCode(employeeCode)) {

            nextNumber++;

            employeeCode = String.format(
                    "EMP%03d",
                    nextNumber
            );
        }

        employee.setEmployeeCode(employeeCode);

        // Save employee
        Employee savedEmployee =
                employeeRepository.save(employee);

        // Generate temporary password
        String temporaryPassword =
                generateTemporaryPassword(employeeCode);

        // Create login account
        User user = new User();

        user.setFirstName(employee.getFirstName());
        user.setLastName(employee.getLastName());
        user.setEmail(employee.getEmail());

        // Store BCrypt hash in database
        user.setPassword(
                passwordEncoder.encode(temporaryPassword)
        );

        user.setRole(Role.EMPLOYEE);

        user.setEmployeeId(employeeCode);
        user.setDepartment(employee.getDepartment());
        user.setDesignation(employee.getDesignation());
        user.setActive(employee.isActive());

        userRepository.save(user);

        // Return employee + temporary password
        return new EmployeeRegistrationResponse(
                savedEmployee,
                temporaryPassword
        );
    }

    @Transactional
    public EmployeeLoginProvisioningResponse createMissingLoginAccounts() {
        List<String> createdEmployeeCodes = new ArrayList<>();
        List<String> conflictingEmployeeCodes = new ArrayList<>();

        for (Employee employee : employeeRepository.findAll()) {
            if (!employee.isActive()) {
                continue;
            }

            var existingUser = userRepository.findByEmailIgnoreCase(employee.getEmail());
            if (existingUser.isPresent()) {
                User user = existingUser.get();
                if (user.getRole() != Role.EMPLOYEE
                        || !employee.getEmployeeCode().equalsIgnoreCase(user.getEmployeeId())) {
                    conflictingEmployeeCodes.add(employee.getEmployeeCode());
                }
                continue;
            }

            byte[] passwordBytes = new byte[32];
            secureRandom.nextBytes(passwordBytes);

            User user = new User();
            user.setFirstName(employee.getFirstName());
            user.setLastName(employee.getLastName());
            user.setEmail(employee.getEmail());
            user.setPassword(passwordEncoder.encode(
                    Base64.getUrlEncoder().withoutPadding().encodeToString(passwordBytes)
            ));
            user.setRole(Role.EMPLOYEE);
            user.setEmployeeId(employee.getEmployeeCode());
            user.setDepartment(employee.getDepartment());
            user.setDesignation(employee.getDesignation());
            user.setActive(true);

            userRepository.save(user);
            createdEmployeeCodes.add(employee.getEmployeeCode());
        }

        return new EmployeeLoginProvisioningResponse(
                createdEmployeeCodes.size(),
                List.copyOf(createdEmployeeCodes),
                List.copyOf(conflictingEmployeeCodes)
        );
    }

    private String generateTemporaryPassword(
            String employeeCode
    ) {

        return "Attend@" + employeeCode;
    }

    public Employee updateEmployee(
            Long id,
            Employee updatedEmployee
    ) {

        Employee employee =
                getEmployeeById(id);

        validateEmployeeType(updatedEmployee.getEmployeeType());

        employee.setEmployeeCode(
                updatedEmployee.getEmployeeCode()
        );

        employee.setFirstName(
                updatedEmployee.getFirstName()
        );

        employee.setLastName(
                updatedEmployee.getLastName()
        );

        employee.setEmail(
                updatedEmployee.getEmail()
        );

        employee.setPhone(
                updatedEmployee.getPhone()
        );

        employee.setDepartment(
                updatedEmployee.getDepartment()
        );

        employee.setDesignation(
                updatedEmployee.getDesignation()
        );

        employee.setEmployeeType(updatedEmployee.getEmployeeType() == null
                ? "DESK" : updatedEmployee.getEmployeeType());

        employee.setJoiningDate(
                updatedEmployee.getJoiningDate()
        );

        employee.setActive(
                updatedEmployee.isActive()
        );

        return employeeRepository.save(employee);
    }

    private void validateEmployeeType(String employeeType) {
        if (employeeType != null && !employeeType.equals("DESK") && !employeeType.equals("FIELD")) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Employee type must be DESK or FIELD"
            );
        }
    }

    public void deleteEmployee(Long id) {

        Employee employee =
                getEmployeeById(id);

        employeeRepository.delete(employee);
    }
}
