package com.attendance.attendance_backend.dto;

import java.time.LocalDate;

public record UserProfileResponse(
        String firstName,
        String lastName,
        String email,
        String role,
        String employeeType,
        String employeeCode,
        String department,
        String designation,
        String phone,
        LocalDate joiningDate,
        boolean active
) {}
