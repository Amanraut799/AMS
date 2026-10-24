package com.attendance.attendance_backend.exception;

public class AttendanceAlreadyMarkedException extends RuntimeException {

    public AttendanceAlreadyMarkedException(String message) {
        super(message);
    }
}