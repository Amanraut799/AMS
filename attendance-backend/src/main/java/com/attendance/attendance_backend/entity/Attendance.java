package com.attendance.attendance_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "attendance",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"employee_id", "attendance_date"}
                )
        }
)
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(nullable = false)
    private String status;

    private LocalDateTime checkInTime;

    private LocalDateTime checkOutTime;

    private Double checkInLatitude;
    private Double checkInLongitude;
    private Double checkInAccuracyMeters;
    private String checkInWorkArea;
    private Double checkOutLatitude;
    private Double checkOutLongitude;
    private Double checkOutAccuracyMeters;
    private String checkOutWorkArea;

    @Column(nullable = false)
    private boolean late;
    @Column(nullable = false)
    private int lateMinutes;
    private Integer workedMinutes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalDateTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public LocalDateTime getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(LocalDateTime checkOutTime) {
        this.checkOutTime = checkOutTime;
    }

    public Double getCheckInLatitude() { return checkInLatitude; }
    public void setCheckInLatitude(Double value) { this.checkInLatitude = value; }
    public Double getCheckInLongitude() { return checkInLongitude; }
    public void setCheckInLongitude(Double value) { this.checkInLongitude = value; }
    public Double getCheckInAccuracyMeters() { return checkInAccuracyMeters; }
    public void setCheckInAccuracyMeters(Double value) { this.checkInAccuracyMeters = value; }
    public String getCheckInWorkArea() { return checkInWorkArea; }
    public void setCheckInWorkArea(String value) { this.checkInWorkArea = value; }
    public Double getCheckOutLatitude() { return checkOutLatitude; }
    public void setCheckOutLatitude(Double value) { this.checkOutLatitude = value; }
    public Double getCheckOutLongitude() { return checkOutLongitude; }
    public void setCheckOutLongitude(Double value) { this.checkOutLongitude = value; }
    public Double getCheckOutAccuracyMeters() { return checkOutAccuracyMeters; }
    public void setCheckOutAccuracyMeters(Double value) { this.checkOutAccuracyMeters = value; }
    public String getCheckOutWorkArea() { return checkOutWorkArea; }
    public void setCheckOutWorkArea(String value) { this.checkOutWorkArea = value; }
    public boolean isLate() { return late; }
    public void setLate(boolean value) { this.late = value; }
    public int getLateMinutes() { return lateMinutes; }
    public void setLateMinutes(int value) { this.lateMinutes = value; }
    public Integer getWorkedMinutes() { return workedMinutes; }
    public void setWorkedMinutes(Integer value) { this.workedMinutes = value; }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
