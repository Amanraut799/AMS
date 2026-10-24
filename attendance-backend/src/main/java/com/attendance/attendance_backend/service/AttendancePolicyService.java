package com.attendance.attendance_backend.service;

import com.attendance.attendance_backend.entity.AttendancePolicy;
import com.attendance.attendance_backend.repository.AttendancePolicyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AttendancePolicyService {
    private static final long POLICY_ID = 1L;
    private final AttendancePolicyRepository repository;
    public AttendancePolicyService(AttendancePolicyRepository repository) { this.repository = repository; }

    public AttendancePolicy get() {
        return repository.findById(POLICY_ID).orElseGet(() -> repository.save(new AttendancePolicy()));
    }

    public AttendancePolicy update(AttendancePolicy input) {
        if (input.getOfficeStartTime() == null || input.getOfficeEndTime() == null
                || input.getCheckInOpensAt() == null || input.getCheckInClosesAt() == null
                || !input.getOfficeStartTime().isBefore(input.getOfficeEndTime())
                || input.getCheckInOpensAt().isAfter(input.getCheckInClosesAt())
                || input.getCheckInOpensAt().isAfter(input.getOfficeStartTime())
                || input.getCheckInClosesAt().isAfter(input.getOfficeEndTime()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Set valid office hours and a check-in window inside those hours.");
        if (input.getLateGraceMinutes() < 0 || input.getLateGraceMinutes() > 180)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Late grace must be between 0 and 180 minutes.");
        if (input.getHalfDayMinimumMinutes() < 60 || input.getHalfDayMinimumMinutes() > 600)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Half-day hours must be between 1 and 10 hours.");
        Set<String> days = parseDays(input.getWeekOffDays());
        if (days.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select at least one weekly off day.");
        AttendancePolicy policy = get();
        policy.setOfficeStartTime(input.getOfficeStartTime());
        policy.setOfficeEndTime(input.getOfficeEndTime());
        policy.setCheckInOpensAt(input.getCheckInOpensAt());
        policy.setCheckInClosesAt(input.getCheckInClosesAt());
        policy.setLateGraceMinutes(input.getLateGraceMinutes());
        policy.setHalfDayMinimumMinutes(input.getHalfDayMinimumMinutes());
        policy.setWeekOffDays(days.stream().sorted().collect(Collectors.joining(",")));
        return repository.save(policy);
    }

    public boolean isWeekOff(LocalDate date) { return getWeekOffDays().contains(date.getDayOfWeek().name()); }
    public Set<String> getWeekOffDays() { return parseDays(get().getWeekOffDays()); }
    public boolean isWorkingDay(LocalDate date) { return !isWeekOff(date); }

    public AttendanceCheckInResult evaluateCheckIn(LocalTime time) {
        AttendancePolicy policy = get();
        if (time.isBefore(policy.getCheckInOpensAt()) || time.isAfter(policy.getCheckInClosesAt()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Check-in is permitted between " + policy.getCheckInOpensAt() + " and " + policy.getCheckInClosesAt() + ".");
        LocalTime onTimeUntil = policy.getOfficeStartTime().plusMinutes(policy.getLateGraceMinutes());
        boolean late = time.isAfter(onTimeUntil);
        int lateMinutes = late ? Math.max(1, (int) java.time.Duration.between(onTimeUntil, time).toMinutes()) : 0;
        return new AttendanceCheckInResult(late, lateMinutes);
    }

    public int getHalfDayMinimumMinutes() { return get().getHalfDayMinimumMinutes(); }

    private Set<String> parseDays(String value) {
        if (value == null || value.isBlank()) return Set.of();
        try {
            return Arrays.stream(value.split(","))
                    .map(String::trim).map(String::toUpperCase)
                    .filter(day -> !day.isEmpty())
                    .peek(DayOfWeek::valueOf)
                    .collect(Collectors.toSet());
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Weekly off days contain an invalid weekday.");
        }
    }

    public record AttendanceCheckInResult(boolean late, int lateMinutes) {}
}
