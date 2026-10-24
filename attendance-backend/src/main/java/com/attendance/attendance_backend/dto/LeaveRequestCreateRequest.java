package com.attendance.attendance_backend.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
public record LeaveRequestCreateRequest(@NotNull LocalDate startDate, @NotNull LocalDate endDate,
        @NotBlank String leaveType, @NotBlank String reason) {}
