package com.attendance.attendance_backend.dto;

import java.util.Map;

public class MonthlyEmployeeAttendance {

    private Long employeeId;
    private String employeeCode;
    private String firstName;
    private String lastName;
    private String department;

    private Map<Integer, String> attendance;

    public MonthlyEmployeeAttendance() {
    }

    public MonthlyEmployeeAttendance(
            Long employeeId,
            String employeeCode,
            String firstName,
            String lastName,
            String department,
            Map<Integer, String> attendance
    ) {
        this.employeeId = employeeId;
        this.employeeCode = employeeCode;
        this.firstName = firstName;
        this.lastName = lastName;
        this.department = department;
        this.attendance = attendance;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Map<Integer, String> getAttendance() {
        return attendance;
    }

    public void setAttendance(
            Map<Integer, String> attendance
    ) {
        this.attendance = attendance;
    }
}