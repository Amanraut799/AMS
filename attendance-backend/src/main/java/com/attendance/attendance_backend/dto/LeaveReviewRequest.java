package com.attendance.attendance_backend.dto;
import jakarta.validation.constraints.NotBlank;
public record LeaveReviewRequest(@NotBlank String status, String reviewerNote) {}
