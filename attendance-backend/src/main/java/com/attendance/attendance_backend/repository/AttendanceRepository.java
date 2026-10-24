package com.attendance.attendance_backend.repository;

import com.attendance.attendance_backend.entity.Attendance;
import com.attendance.attendance_backend.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository
        extends JpaRepository<Attendance, Long> {

    java.util.Optional<Attendance> findByEmployeeAndAttendanceDate(
            Employee employee,
            LocalDate attendanceDate
    );

    boolean existsByEmployeeAndAttendanceDate(
            Employee employee,
            LocalDate attendanceDate
    );

    List<Attendance> findByEmployeeOrderByAttendanceDateDesc(
            Employee employee
    );

    List<Attendance> findAllByOrderByAttendanceDateDesc();

    long countByAttendanceDate(LocalDate attendanceDate);

    long countByAttendanceDateAndStatus(
            LocalDate attendanceDate,
            String status
    );

    long countByAttendanceDateAndCheckInTimeIsNotNull(
            LocalDate attendanceDate
    );

    long countByAttendanceDateAndCheckOutTimeIsNotNull(
            LocalDate attendanceDate
    );

    List<Attendance> findByAttendanceDateOrderByCheckInTimeDesc(
            LocalDate attendanceDate
    );

    List<Attendance> findByAttendanceDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );
}