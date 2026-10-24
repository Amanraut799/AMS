package com.attendance.attendance_backend.controller;

import com.attendance.attendance_backend.entity.AttendancePolicy;
import com.attendance.attendance_backend.service.AttendancePolicyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attendance-policy")
public class AttendancePolicyController {
    private final AttendancePolicyService service;
    public AttendancePolicyController(AttendancePolicyService service) { this.service = service; }
    @GetMapping public ResponseEntity<AttendancePolicy> get() { return ResponseEntity.ok(service.get()); }
    @PutMapping public ResponseEntity<AttendancePolicy> update(@RequestBody AttendancePolicy policy) { return ResponseEntity.ok(service.update(policy)); }
}
