package com.attendance.attendance_backend.dto;

import java.util.List;

public record EmployeeLoginProvisioningResponse(
        int createdCount,
        List<String> createdEmployeeCodes,
        List<String> conflictingEmployeeCodes
) {
}
