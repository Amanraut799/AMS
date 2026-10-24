package com.attendance.attendance_backend.controller;

import com.attendance.attendance_backend.entity.Attendance;
import com.attendance.attendance_backend.dto.AttendanceStatusUpdateRequest;
import com.attendance.attendance_backend.dto.AttendanceLocationRequest;
import com.attendance.attendance_backend.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/my-attendance")
    public ResponseEntity<Attendance> markMyAttendance(
            Authentication authentication,
            @Valid @RequestBody AttendanceLocationRequest location
    ) {
        String email = authentication.getName();

        Attendance attendance =
                attendanceService.markMyAttendance(email, location);

        return ResponseEntity.status(201).body(attendance);
    }

    @GetMapping("/my-attendance/today")
    public ResponseEntity<Attendance> getMyTodayAttendance(
            Authentication authentication
    ) {
        String email = authentication.getName();

        Attendance attendance =
                attendanceService.getMyTodayAttendance(email);

        if (attendance == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(attendance);
    }

    @PostMapping("/my-attendance/check-out")
    public ResponseEntity<Attendance> checkOut(
            Authentication authentication,
            @Valid @RequestBody AttendanceLocationRequest location
    ) {
        String email = authentication.getName();

        Attendance attendance =
                attendanceService.checkOut(email, location);

        return ResponseEntity.ok(attendance);
    }

    @GetMapping("/my-attendance/history")
    public ResponseEntity<List<Attendance>> getMyAttendanceHistory(
            Authentication authentication
    ) {
        String email = authentication.getName();

        List<Attendance> history =
                attendanceService.getMyAttendanceHistory(email);

        return ResponseEntity.ok(history);
    }

    @GetMapping("/admin")
    public ResponseEntity<List<Attendance>> getAllAttendance() {

        List<Attendance> attendance =
                attendanceService.getAllAttendance();

        return ResponseEntity.ok(attendance);
    }

    @PutMapping("/admin/{employeeId}/{date}")
    public ResponseEntity<Attendance> updateAttendanceStatus(
            @PathVariable Long employeeId,
            @PathVariable java.time.LocalDate date,
            @Valid @RequestBody AttendanceStatusUpdateRequest request
    ) {
        Attendance attendance = attendanceService.updateAttendanceStatus(
                employeeId,
                date,
                request.status()
        );

        return ResponseEntity.ok(attendance);
    }
}
