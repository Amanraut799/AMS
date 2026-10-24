package com.attendance.attendance_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_requests")
public class LeaveRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    @Column(nullable = false)
    private LocalDate startDate;
    @Column(nullable = false)
    private LocalDate endDate;
    @Column(nullable = false, length = 40)
    private String leaveType;
    @Column(nullable = false, length = 1000)
    private String reason;
    @Column(nullable = false, length = 20)
    private String status = "PENDING";
    @Column(nullable = false)
    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;
    private String reviewedBy;
    @Column(length = 1000)
    private String reviewerNote;
    @PrePersist protected void onCreate() { appliedAt = LocalDateTime.now(); if (status == null) status = "PENDING"; }
    public Long getId() { return id; }
    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee value) { this.employee = value; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate value) { this.startDate = value; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate value) { this.endDate = value; }
    public String getLeaveType() { return leaveType; }
    public void setLeaveType(String value) { this.leaveType = value; }
    public String getReason() { return reason; }
    public void setReason(String value) { this.reason = value; }
    public String getStatus() { return status; }
    public void setStatus(String value) { this.status = value; }
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime value) { this.reviewedAt = value; }
    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String value) { this.reviewedBy = value; }
    public String getReviewerNote() { return reviewerNote; }
    public void setReviewerNote(String value) { this.reviewerNote = value; }
}
