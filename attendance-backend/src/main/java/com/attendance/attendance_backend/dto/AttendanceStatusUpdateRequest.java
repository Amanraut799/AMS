package com.attendance.attendance_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AttendanceStatusUpdateRequest(
        @NotBlank
        @Pattern(regexp = "PRESENT|ABSENT", message = "Status must be PRESENT or ABSENT")
        String status
) {
}
