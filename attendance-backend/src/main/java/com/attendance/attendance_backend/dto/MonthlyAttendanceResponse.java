package com.attendance.attendance_backend.dto;

import java.util.List;
import java.util.Map;

public class MonthlyAttendanceResponse {

    private int year;
    private int month;
    private int daysInMonth;

    private long totalEmployees;
    private long totalPresent;
    private long totalAbsent;
    private long attendanceRate;

    private List<MonthlyEmployeeAttendance> employees;
    private Map<Integer, String> nonWorkingDays;

    public MonthlyAttendanceResponse() {
    }

    public MonthlyAttendanceResponse(
            int year,
            int month,
            int daysInMonth,
            long totalEmployees,
            long totalPresent,
            long totalAbsent,
            long attendanceRate,
            List<MonthlyEmployeeAttendance> employees,
            Map<Integer, String> nonWorkingDays
    ) {
        this.year = year;
        this.month = month;
        this.daysInMonth = daysInMonth;
        this.totalEmployees = totalEmployees;
        this.totalPresent = totalPresent;
        this.totalAbsent = totalAbsent;
        this.attendanceRate = attendanceRate;
        this.employees = employees;
        this.nonWorkingDays = nonWorkingDays;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public int getDaysInMonth() {
        return daysInMonth;
    }

    public void setDaysInMonth(int daysInMonth) {
        this.daysInMonth = daysInMonth;
    }

    public long getTotalEmployees() {
        return totalEmployees;
    }

    public void setTotalEmployees(long totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    public long getTotalPresent() {
        return totalPresent;
    }

    public void setTotalPresent(long totalPresent) {
        this.totalPresent = totalPresent;
    }

    public long getTotalAbsent() {
        return totalAbsent;
    }

    public void setTotalAbsent(long totalAbsent) {
        this.totalAbsent = totalAbsent;
    }

    public long getAttendanceRate() {
        return attendanceRate;
    }

    public void setAttendanceRate(long attendanceRate) {
        this.attendanceRate = attendanceRate;
    }

    public List<MonthlyEmployeeAttendance> getEmployees() {
        return employees;
    }

    public void setEmployees(
            List<MonthlyEmployeeAttendance> employees
    ) {
        this.employees = employees;
    }

    public Map<Integer, String> getNonWorkingDays() { return nonWorkingDays; }
    public void setNonWorkingDays(Map<Integer, String> nonWorkingDays) { this.nonWorkingDays = nonWorkingDays; }
}
