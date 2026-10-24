package com.attendance.attendance_backend.service;

import com.attendance.attendance_backend.dto.LeaveRequestCreateRequest;
import com.attendance.attendance_backend.dto.LeaveReviewRequest;
import com.attendance.attendance_backend.entity.Employee;
import com.attendance.attendance_backend.entity.LeaveRequest;
import com.attendance.attendance_backend.entity.User;
import com.attendance.attendance_backend.repository.EmployeeRepository;
import com.attendance.attendance_backend.repository.LeaveRequestRepository;
import com.attendance.attendance_backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import org.springframework.beans.factory.annotation.Value;
import java.util.List;

@Service
public class LeaveService {
    private final LeaveRequestRepository leaveRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    @Value("${app.time-zone:Asia/Kolkata}")
    private String businessTimeZone;
    public LeaveService(LeaveRequestRepository leaveRepository, UserRepository userRepository, EmployeeRepository employeeRepository) {
        this.leaveRepository = leaveRepository; this.userRepository = userRepository; this.employeeRepository = employeeRepository;
    }
    public List<LeaveRequest> myRequests(String email) {
        Employee employee = getEmployee(email);
        return leaveRepository.findByEmployeeOrderByAppliedAtDesc(employee);
    }
    public LeaveRequest request(String email, LeaveRequestCreateRequest request) {
        Employee employee = getEmployee(email);
        if (request.startDate().isBefore(LocalDate.now(ZoneId.of(businessTimeZone))) || request.endDate().isBefore(request.startDate()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Leave dates must be today or later, and the end date cannot precede the start date.");
        String type = request.leaveType().trim().toUpperCase();
        if (!List.of("CASUAL", "SICK", "UNPAID", "OTHER").contains(type))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select a valid leave type.");
        if (leaveRepository.existsByEmployeeAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(employee, "PENDING", request.endDate(), request.startDate())
                || leaveRepository.existsByEmployeeAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(employee, "APPROVED", request.endDate(), request.startDate()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A pending or approved leave request already overlaps these dates.");
        LeaveRequest leave = new LeaveRequest();
        leave.setEmployee(employee); leave.setStartDate(request.startDate()); leave.setEndDate(request.endDate());
        leave.setLeaveType(type); leave.setReason(request.reason().trim()); leave.setStatus("PENDING");
        return leaveRepository.save(leave);
    }
    public List<LeaveRequest> allRequests() { return leaveRepository.findAllByOrderByAppliedAtDesc(); }
    @Transactional
    public LeaveRequest review(Long id, LeaveReviewRequest request, String reviewerEmail) {
        LeaveRequest leave = leaveRepository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Leave request not found."));
        if (!"PENDING".equals(leave.getStatus()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This request has already been reviewed.");
        String status = request.status().trim().toUpperCase();
        if (!List.of("APPROVED", "REJECTED").contains(status))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Review status must be APPROVED or REJECTED.");
        if ("APPROVED".equals(status)) {
            List<LeaveRequest> conflicts = leaveRepository.findByEmployeeAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                    leave.getEmployee(), "APPROVED", leave.getEndDate(), leave.getStartDate());
            if (conflicts.stream().anyMatch(existing -> !existing.getId().equals(id)))
                throw new ResponseStatusException(HttpStatus.CONFLICT, "This request overlaps another approved leave.");
        }
        leave.setStatus(status); leave.setReviewerNote(request.reviewerNote()); leave.setReviewedBy(reviewerEmail); leave.setReviewedAt(LocalDateTime.now(ZoneId.of(businessTimeZone)));
        return leaveRepository.save(leave);
    }
    public List<LeaveRequest> approvedOverlapping(List<Employee> employees, LocalDate from, LocalDate to) {
        if (employees.isEmpty()) return List.of();
        return leaveRepository.findByEmployeeInAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(employees, "APPROVED", to, from);
    }
    private Employee getEmployee(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        if (!user.isActive()) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This account is inactive.");
        return employeeRepository.findByEmail(user.getEmail()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee profile not found."));
    }
}
