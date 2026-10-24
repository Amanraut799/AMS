package com.attendance.attendance_backend.dto;

import com.attendance.attendance_backend.entity.Employee;

public class EmployeeRegistrationResponse {

    private Employee employee;
    private String temporaryPassword;

    public EmployeeRegistrationResponse() {
    }

    public EmployeeRegistrationResponse(
            Employee employee,
            String temporaryPassword
    ) {
        this.employee = employee;
        this.temporaryPassword = temporaryPassword;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public String getTemporaryPassword() {
        return temporaryPassword;
    }

    public void setTemporaryPassword(String temporaryPassword) {
        this.temporaryPassword = temporaryPassword;
    }
}