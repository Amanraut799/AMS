package com.attendance.attendance_backend.dto;

public class AdminDashboardResponse {

    private long totalEmployees;
    private long presentToday;
    private long halfDayToday;
    private long absentToday;
    private long attendanceRate;
    private long checkedIn;
    private long checkedOut;
    private long totalAttendanceRecords;

    public AdminDashboardResponse() {
    }

    public AdminDashboardResponse(
            long totalEmployees,
            long presentToday,
            long halfDayToday,
            long absentToday,
            long attendanceRate,
            long checkedIn,
            long checkedOut,
            long totalAttendanceRecords
    ) {
        this.totalEmployees = totalEmployees;
        this.presentToday = presentToday;
        this.halfDayToday = halfDayToday;
        this.absentToday = absentToday;
        this.attendanceRate = attendanceRate;
        this.checkedIn = checkedIn;
        this.checkedOut = checkedOut;
        this.totalAttendanceRecords = totalAttendanceRecords;
    }

    public long getTotalEmployees() {
        return totalEmployees;
    }

    public void setTotalEmployees(long totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    public long getPresentToday() {
        return presentToday;
    }

    public void setPresentToday(long presentToday) {
        this.presentToday = presentToday;
    }

    public long getHalfDayToday() { return halfDayToday; }
    public void setHalfDayToday(long halfDayToday) { this.halfDayToday = halfDayToday; }

    public long getAbsentToday() {
        return absentToday;
    }

    public void setAbsentToday(long absentToday) {
        this.absentToday = absentToday;
    }

    public long getAttendanceRate() {
        return attendanceRate;
    }

    public void setAttendanceRate(long attendanceRate) {
        this.attendanceRate = attendanceRate;
    }

    public long getCheckedIn() {
        return checkedIn;
    }

    public void setCheckedIn(long checkedIn) {
        this.checkedIn = checkedIn;
    }

    public long getCheckedOut() {
        return checkedOut;
    }

    public void setCheckedOut(long checkedOut) {
        this.checkedOut = checkedOut;
    }

    public long getTotalAttendanceRecords() {
        return totalAttendanceRecords;
    }

    public void setTotalAttendanceRecords(long totalAttendanceRecords) {
        this.totalAttendanceRecords = totalAttendanceRecords;
    }
}
