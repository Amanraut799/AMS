package com.attendance.attendance_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AttendanceStatusUpdateRequest(
        @NotBlank
        @Pattern(regexp = "PRESENT|ABSENT|WEEKLY_OFF", message = "Status must be PRESENT, ABSENT, or WEEKLY_OFF")
        String status
) {
}
