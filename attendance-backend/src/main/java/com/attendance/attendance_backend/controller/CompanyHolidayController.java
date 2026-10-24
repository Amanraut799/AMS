package com.attendance.attendance_backend.controller;

import com.attendance.attendance_backend.entity.CompanyHoliday;
import com.attendance.attendance_backend.service.CompanyHolidayService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/holidays")
public class CompanyHolidayController {
    private final CompanyHolidayService service;
    public CompanyHolidayController(CompanyHolidayService service) { this.service = service; }
    @GetMapping public ResponseEntity<List<CompanyHoliday>> list() { return ResponseEntity.ok(service.list()); }
    @PostMapping public ResponseEntity<CompanyHoliday> create(@RequestBody CompanyHoliday holiday) { return ResponseEntity.status(201).body(service.create(holiday)); }
    @PutMapping("/{id}") public ResponseEntity<CompanyHoliday> update(@PathVariable Long id, @RequestBody CompanyHoliday holiday) { return ResponseEntity.ok(service.update(id, holiday)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
