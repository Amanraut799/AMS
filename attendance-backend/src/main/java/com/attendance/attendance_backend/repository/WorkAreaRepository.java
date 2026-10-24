package com.attendance.attendance_backend.repository;

import com.attendance.attendance_backend.entity.WorkArea;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkAreaRepository extends JpaRepository<WorkArea, Long> {
    List<WorkArea> findAllByOrderByNameAsc();
    List<WorkArea> findByActiveTrue();
}
