package com.attendance.attendance_backend.entity;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "attendance_policy")
public class AttendancePolicy {
    @Id
    private Long id = 1L;
    @Column(nullable = false)
    private LocalTime officeStartTime = LocalTime.of(9, 0);
    @Column(nullable = false)
    private LocalTime officeEndTime = LocalTime.of(18, 0);
    @Column(nullable = false)
    private LocalTime checkInOpensAt = LocalTime.of(8, 0);
    @Column(nullable = false)
    private LocalTime checkInClosesAt = LocalTime.of(11, 0);
    @Column(nullable = false)
    private int lateGraceMinutes = 15;
    @Column(nullable = false)
    private int halfDayMinimumMinutes = 240;
    @Column(nullable = false, length = 100)
    private String weekOffDays = "SUNDAY";

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalTime getOfficeStartTime() { return officeStartTime; }
    public void setOfficeStartTime(LocalTime value) { this.officeStartTime = value; }
    public LocalTime getOfficeEndTime() { return officeEndTime; }
    public void setOfficeEndTime(LocalTime value) { this.officeEndTime = value; }
    public LocalTime getCheckInOpensAt() { return checkInOpensAt; }
    public void setCheckInOpensAt(LocalTime value) { this.checkInOpensAt = value; }
    public LocalTime getCheckInClosesAt() { return checkInClosesAt; }
    public void setCheckInClosesAt(LocalTime value) { this.checkInClosesAt = value; }
    public int getLateGraceMinutes() { return lateGraceMinutes; }
    public void setLateGraceMinutes(int value) { this.lateGraceMinutes = value; }
    public int getHalfDayMinimumMinutes() { return halfDayMinimumMinutes; }
    public void setHalfDayMinimumMinutes(int value) { this.halfDayMinimumMinutes = value; }
    public String getWeekOffDays() { return weekOffDays; }
    public void setWeekOffDays(String value) { this.weekOffDays = value; }
}
