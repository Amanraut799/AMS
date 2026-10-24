package com.attendance.attendance_backend.repository;
import com.attendance.attendance_backend.entity.AttendancePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AttendancePolicyRepository extends JpaRepository<AttendancePolicy, Long> {}
