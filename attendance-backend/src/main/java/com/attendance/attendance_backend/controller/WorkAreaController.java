package com.attendance.attendance_backend.controller;

import com.attendance.attendance_backend.entity.WorkArea;
import com.attendance.attendance_backend.service.WorkAreaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/work-areas")
public class WorkAreaController {
    private final WorkAreaService service;
    public WorkAreaController(WorkAreaService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<List<WorkArea>> list() { return ResponseEntity.ok(service.list()); }

    @PostMapping
    public ResponseEntity<WorkArea> create(@RequestBody WorkArea area) {
        return ResponseEntity.status(201).body(service.save(area));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkArea> update(@PathVariable Long id, @RequestBody WorkArea area) {
        return ResponseEntity.ok(service.update(id, area));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
