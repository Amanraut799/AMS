package com.attendance.attendance_backend.service;

import com.attendance.attendance_backend.dto.UserProfileResponse;
import com.attendance.attendance_backend.entity.Employee;
import com.attendance.attendance_backend.entity.User;
import com.attendance.attendance_backend.repository.EmployeeRepository;
import com.attendance.attendance_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    public UserProfileService(UserRepository userRepository, EmployeeRepository employeeRepository) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
    }

    public UserProfileResponse getMyProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Employee employee = employeeRepository.findByEmail(user.getEmail()).orElse(null);

        return new UserProfileResponse(
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().name(),
                employee != null ? employee.getEmployeeType() : null,
                employee != null ? employee.getEmployeeCode() : user.getEmployeeId(),
                employee != null ? employee.getDepartment() : user.getDepartment(),
                employee != null ? employee.getDesignation() : user.getDesignation(),
                employee != null ? employee.getPhone() : null,
                employee != null ? employee.getJoiningDate() : null,
                user.isActive()
        );
    }
}
