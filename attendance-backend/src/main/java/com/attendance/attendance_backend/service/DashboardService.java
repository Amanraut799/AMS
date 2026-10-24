package com.attendance.attendance_backend.service;

import com.attendance.attendance_backend.dto.AdminDashboardResponse;
import com.attendance.attendance_backend.repository.AttendanceRepository;
import com.attendance.attendance_backend.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import org.springframework.beans.factory.annotation.Value;


import com.attendance.attendance_backend.dto.MonthlyAttendanceResponse;
import com.attendance.attendance_backend.dto.MonthlyEmployeeAttendance;
import com.attendance.attendance_backend.entity.Attendance;
import com.attendance.attendance_backend.entity.Employee;
import com.attendance.attendance_backend.entity.LeaveRequest;
import com.attendance.attendance_backend.entity.CompanyHoliday;
import java.util.HashSet;
import java.util.Set;

import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final CompanyHolidayService holidayService;
    private final AttendancePolicyService policyService;
    private final LeaveService leaveService;
    @Value("${app.time-zone:Asia/Kolkata}")
    private String businessTimeZone;

    public DashboardService(
            EmployeeRepository employeeRepository,
            AttendanceRepository attendanceRepository,
            CompanyHolidayService holidayService,
            AttendancePolicyService policyService,
            LeaveService leaveService
    ) {
        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
        this.holidayService = holidayService;
        this.policyService = policyService;
        this.leaveService = leaveService;
    }

    public AdminDashboardResponse getAdminDashboard() {

        LocalDate today = LocalDate.now(ZoneId.of(businessTimeZone));

        long totalEmployees =
                employeeRepository.count();

        long presentToday =
                attendanceRepository.countByAttendanceDateAndStatus(
                        today,
                        "PRESENT"
                );
        long halfDayToday = attendanceRepository.countByAttendanceDateAndStatus(today, "HALF_DAY");

        long checkedIn =
                attendanceRepository
                        .countByAttendanceDateAndCheckInTimeIsNotNull(today);

        long checkedOut =
                attendanceRepository
                        .countByAttendanceDateAndCheckOutTimeIsNotNull(today);

        long totalAttendanceRecords =
                attendanceRepository.countByAttendanceDate(today);

        List<Employee> employees = employeeRepository.findAll();
        boolean nonWorkingToday = policyService.isWeekOff(today)
                || !holidayService.between(today, today).isEmpty();
        long expectedToday = nonWorkingToday ? 0 : totalEmployees;
        if (!nonWorkingToday) {
            Set<Long> onLeave = leaveService.approvedOverlapping(employees, today, today).stream()
                    .map(request -> request.getEmployee().getId()).collect(java.util.stream.Collectors.toSet());
            expectedToday -= onLeave.size();
        }

        long absentToday = Math.max(0, expectedToday - presentToday - halfDayToday);

        if (absentToday < 0) {
            absentToday = 0;
        }

        long attendanceRate = 0;

        if (expectedToday > 0) {
            attendanceRate =
                    Math.round(
                            ((double) (presentToday + halfDayToday * 0.5) / expectedToday) * 100
                    );
        }

        return new AdminDashboardResponse(
                totalEmployees,
                presentToday,
                halfDayToday,
                absentToday,
                attendanceRate,
                checkedIn,
                checkedOut,
                totalAttendanceRecords
        );
    }

    public MonthlyAttendanceResponse getMonthlyAttendance(
            int year,
            int month
    ) {

        YearMonth yearMonth = YearMonth.of(year, month);

        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Employee> employees =
                employeeRepository.findAll();

        List<Attendance> attendanceRecords =
                attendanceRepository.findByAttendanceDateBetween(
                        startDate,
                        endDate
                );

        List<CompanyHoliday> holidays = holidayService.between(startDate, endDate);
        Set<LocalDate> holidayDates = holidays.stream().map(CompanyHoliday::getHolidayDate).collect(java.util.stream.Collectors.toSet());
        Map<Integer, String> nonWorkingDays = new HashMap<>();
        Set<LocalDate> expectedWorkDates = new HashSet<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            if (holidayDates.contains(date)) {
                nonWorkingDays.put(date.getDayOfMonth(), "HOLIDAY");
            } else if (policyService.isWeekOff(date)) {
                nonWorkingDays.put(date.getDayOfMonth(), "WEEKLY_OFF");
            } else {
                expectedWorkDates.add(date);
            }
        }

        Map<Long, Map<Integer, String>> attendanceMap =
                new HashMap<>();

        long totalPresent = 0;
        long totalHalfDays = 0;

        for (Attendance attendance : attendanceRecords) {

            Long employeeId =
                    attendance.getEmployee().getId();

            int day =
                    attendance.getAttendanceDate().getDayOfMonth();

            attendanceMap
                    .computeIfAbsent(
                            employeeId,
                            key -> new HashMap<>()
                    )
                    .put(
                            day,
                            attendance.getStatus()
                    );

        }

        List<LeaveRequest> approvedLeaves = leaveService.approvedOverlapping(employees, startDate, endDate);
        Map<Long, Set<LocalDate>> leaveDatesByEmployee = new HashMap<>();
        for (LeaveRequest leave : approvedLeaves) {
            LocalDate from = leave.getStartDate().isAfter(startDate) ? leave.getStartDate() : startDate;
            LocalDate to = leave.getEndDate().isBefore(endDate) ? leave.getEndDate() : endDate;
            for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
                if (expectedWorkDates.contains(date)) {
                    leaveDatesByEmployee.computeIfAbsent(leave.getEmployee().getId(), ignored -> new HashSet<>()).add(date);
                    attendanceMap.computeIfAbsent(leave.getEmployee().getId(), ignored -> new HashMap<>())
                            .putIfAbsent(date.getDayOfMonth(), "LEAVE");
                }
            }
        }

        // Actual worked records take precedence over holidays or approved leave entries.
        for (Attendance attendance : attendanceRecords) {
            attendanceMap.computeIfAbsent(attendance.getEmployee().getId(), ignored -> new HashMap<>())
                    .put(attendance.getAttendanceDate().getDayOfMonth(), attendance.getStatus());
            if (expectedWorkDates.contains(attendance.getAttendanceDate())) {
                Set<LocalDate> employeeLeaveDates = leaveDatesByEmployee.get(attendance.getEmployee().getId());
                if (employeeLeaveDates != null) employeeLeaveDates.remove(attendance.getAttendanceDate());
                if ("PRESENT".equalsIgnoreCase(attendance.getStatus())) totalPresent++;
                else if ("HALF_DAY".equalsIgnoreCase(attendance.getStatus())) totalHalfDays++;
            }
        }

        List<MonthlyEmployeeAttendance> employeeData =
                new ArrayList<>();

        long totalPossibleAttendance = 0;
        long totalAbsent = 0;
        long totalEmployees = employees.size();
        for (Employee employee : employees) {

            Map<Integer, String> dailyAttendance =
                    attendanceMap.getOrDefault(
                            employee.getId(),
                            new HashMap<>()
                    );

            MonthlyEmployeeAttendance data =
                    new MonthlyEmployeeAttendance(
                            employee.getId(),
                            employee.getEmployeeCode(),
                            employee.getFirstName(),
                            employee.getLastName(),
                            employee.getDepartment(),
                            dailyAttendance
                    );

            employeeData.add(data);
            for (LocalDate date : expectedWorkDates) {
                if (!leaveDatesByEmployee.getOrDefault(employee.getId(), Set.of()).contains(date)) {
                    totalPossibleAttendance++;
                    String status = dailyAttendance.get(date.getDayOfMonth());
                    if (status == null || "ABSENT".equalsIgnoreCase(status)) totalAbsent++;
                }
            }
        }

        long attendanceRate = 0;

        if (totalPossibleAttendance > 0) {

            attendanceRate =
                    Math.round(
                            ((double) (totalPresent + totalHalfDays * 0.5)
                                    / totalPossibleAttendance)
                                    * 100
                    );
        }

        return new MonthlyAttendanceResponse(
                year,
                month,
                yearMonth.lengthOfMonth(),
                totalEmployees,
                totalPresent,
                totalAbsent,
                attendanceRate,
                employeeData,
                nonWorkingDays
        );
    }
}
