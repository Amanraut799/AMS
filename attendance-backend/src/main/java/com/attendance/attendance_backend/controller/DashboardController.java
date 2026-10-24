package com.attendance.attendance_backend.controller;

import com.attendance.attendance_backend.dto.AdminDashboardResponse;
import com.attendance.attendance_backend.entity.Attendance;
import com.attendance.attendance_backend.service.AttendanceService;
import com.attendance.attendance_backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.attendance.attendance_backend.dto.MonthlyAttendanceResponse;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final AttendanceService attendanceService;

    public DashboardController(
            DashboardService dashboardService,
            AttendanceService attendanceService
    ) {
        this.dashboardService = dashboardService;
        this.attendanceService = attendanceService;
    }

    @GetMapping("/admin")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {

        return ResponseEntity.ok(
                dashboardService.getAdminDashboard()
        );
    }

    @GetMapping("/admin/today")
    public ResponseEntity<List<Attendance>> getTodayAttendance() {

        return ResponseEntity.ok(
                attendanceService.getTodayAttendance()
        );
    }

    @GetMapping("/admin/monthly")
    public ResponseEntity<MonthlyAttendanceResponse>
    getMonthlyAttendance(
            @RequestParam int year,
            @RequestParam int month
    ) {

        return ResponseEntity.ok(
                dashboardService.getMonthlyAttendance(
                        year,
                        month
                )
        );
    }
}