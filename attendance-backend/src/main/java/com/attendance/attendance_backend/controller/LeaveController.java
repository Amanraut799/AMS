package com.attendance.attendance_backend.controller;

import com.attendance.attendance_backend.dto.LeaveRequestCreateRequest;
import com.attendance.attendance_backend.dto.LeaveReviewRequest;
import com.attendance.attendance_backend.entity.LeaveRequest;
import com.attendance.attendance_backend.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {
    private final LeaveService service;
    public LeaveController(LeaveService service) { this.service = service; }
    @GetMapping("/my") public ResponseEntity<List<LeaveRequest>> mine(Authentication auth) { return ResponseEntity.ok(service.myRequests(auth.getName())); }
    @PostMapping public ResponseEntity<LeaveRequest> request(Authentication auth, @Valid @RequestBody LeaveRequestCreateRequest request) { return ResponseEntity.status(201).body(service.request(auth.getName(), request)); }
    @GetMapping("/admin") public ResponseEntity<List<LeaveRequest>> all() { return ResponseEntity.ok(service.allRequests()); }
    @PutMapping("/admin/{id}") public ResponseEntity<LeaveRequest> review(@PathVariable Long id, Authentication auth, @Valid @RequestBody LeaveReviewRequest request) { return ResponseEntity.ok(service.review(id, request, auth.getName())); }
}
