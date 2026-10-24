package com.attendance.attendance_backend.service;

import com.attendance.attendance_backend.entity.Attendance;
import com.attendance.attendance_backend.entity.Employee;
import com.attendance.attendance_backend.entity.User;
import com.attendance.attendance_backend.entity.WorkArea;
import com.attendance.attendance_backend.dto.AttendanceLocationRequest;
import com.attendance.attendance_backend.exception.AttendanceAlreadyMarkedException;
import com.attendance.attendance_backend.repository.AttendanceRepository;
import com.attendance.attendance_backend.repository.EmployeeRepository;
import com.attendance.attendance_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import org.springframework.beans.factory.annotation.Value;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final WorkAreaService workAreaService;
    private final AttendancePolicyService attendancePolicyService;
    @Value("${app.time-zone:Asia/Kolkata}")
    private String businessTimeZone;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository,
            UserRepository userRepository,
            WorkAreaService workAreaService,
            AttendancePolicyService attendancePolicyService
    ) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.workAreaService = workAreaService;
        this.attendancePolicyService = attendancePolicyService;
    }

    public Attendance markMyAttendance(String email, AttendanceLocationRequest location) {

        // Find logged-in user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        // Find employee using the same email
        Employee employee = employeeRepository.findByEmail(user.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee profile not found for: " + user.getEmail()
                        )
                );

        LocalDateTime checkInTime = LocalDateTime.now(ZoneId.of(businessTimeZone));
        AttendancePolicyService.AttendanceCheckInResult timing = attendancePolicyService.evaluateCheckIn(checkInTime.toLocalTime());
        WorkArea area = workAreaService.validateAttendanceLocation(employee,
                location.latitude(), location.longitude(), location.accuracyMeters());

        LocalDate today = LocalDate.now(ZoneId.of(businessTimeZone));

        // Prevent duplicate attendance
        if (attendanceRepository.existsByEmployeeAndAttendanceDate(
                employee,
                today
        )) {
            throw new AttendanceAlreadyMarkedException(
                    "Attendance already marked for today"
            );
        }

        Attendance attendance = new Attendance();

        attendance.setEmployee(employee);
        attendance.setAttendanceDate(today);
        attendance.setStatus("PRESENT");
        attendance.setCheckInTime(checkInTime);
        attendance.setLate(timing.late());
        attendance.setLateMinutes(timing.lateMinutes());
        attendance.setCheckInLatitude(location.latitude());
        attendance.setCheckInLongitude(location.longitude());
        attendance.setCheckInAccuracyMeters(location.accuracyMeters());
        attendance.setCheckInWorkArea(area.getName());

        return attendanceRepository.save(attendance);
    }

    public Attendance getMyTodayAttendance(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Employee employee = employeeRepository.findByEmail(user.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee profile not found for: " + user.getEmail()
                        )
                );

        LocalDate today = LocalDate.now(ZoneId.of(businessTimeZone));

        return attendanceRepository
                .findByEmployeeAndAttendanceDate(employee, today)
                .orElse(null);
    }

    public Attendance checkOut(String email, AttendanceLocationRequest location) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Employee employee = employeeRepository.findByEmail(user.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee profile not found for: " + user.getEmail()
                        )
                );

        WorkArea area = workAreaService.validateAttendanceLocation(employee,
                location.latitude(), location.longitude(), location.accuracyMeters());

        LocalDate today = LocalDate.now(ZoneId.of(businessTimeZone));

        Attendance attendance = attendanceRepository
                .findByEmployeeAndAttendanceDate(employee, today)
                .orElseThrow(() ->
                        new RuntimeException(
                                "You have not marked attendance today"
                        )
                );

        if (attendance.getCheckOutTime() != null) {
            throw new RuntimeException(
                    "Attendance already checked out"
            );
        }

        LocalDateTime checkOutTime = LocalDateTime.now(ZoneId.of(businessTimeZone));
        attendance.setCheckOutTime(checkOutTime);
        int workedMinutes = Math.max(0, (int) java.time.Duration.between(attendance.getCheckInTime(), checkOutTime).toMinutes());
        attendance.setWorkedMinutes(workedMinutes);
        if (workedMinutes < attendancePolicyService.getHalfDayMinimumMinutes()) {
            attendance.setStatus("HALF_DAY");
        }
        attendance.setCheckOutLatitude(location.latitude());
        attendance.setCheckOutLongitude(location.longitude());
        attendance.setCheckOutAccuracyMeters(location.accuracyMeters());
        attendance.setCheckOutWorkArea(area.getName());

        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getMyAttendanceHistory(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Employee employee = employeeRepository.findByEmail(user.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee profile not found for: " + user.getEmail()
                        )
                );

        return attendanceRepository
                .findByEmployeeOrderByAttendanceDateDesc(employee);
    }

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAllByOrderByAttendanceDateDesc();
    }

    public Attendance updateAttendanceStatus(
            Long employeeId,
            LocalDate attendanceDate,
            String status
    ) {
        if ("WEEKLY_OFF".equals(status) && !attendancePolicyService.isWeekOff(attendanceDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only a configured weekly off can be restored to weekly off");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found"
                ));

        Attendance attendance = attendanceRepository
                .findByEmployeeAndAttendanceDate(employee, attendanceDate)
                .orElseGet(() -> {
                    Attendance newAttendance = new Attendance();
                    newAttendance.setEmployee(employee);
                    newAttendance.setAttendanceDate(attendanceDate);
                    return newAttendance;
                });

        attendance.setStatus(status);
        if ("ABSENT".equals(status) || "WEEKLY_OFF".equals(status)) {
            attendance.setCheckInTime(null);
            attendance.setCheckOutTime(null);
            attendance.setLate(false);
            attendance.setLateMinutes(0);
            attendance.setWorkedMinutes(null);
            attendance.setCheckInLatitude(null);
            attendance.setCheckInLongitude(null);
            attendance.setCheckInAccuracyMeters(null);
            attendance.setCheckInWorkArea(null);
            attendance.setCheckOutLatitude(null);
            attendance.setCheckOutLongitude(null);
            attendance.setCheckOutAccuracyMeters(null);
            attendance.setCheckOutWorkArea(null);
        }

        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getTodayAttendance() {
        return attendanceRepository
                .findByAttendanceDateOrderByCheckInTimeDesc(
                        LocalDate.now(ZoneId.of(businessTimeZone))
                );
    }
}
