package com.attendance.attendance_backend.service;

import com.attendance.attendance_backend.entity.CompanyHoliday;
import com.attendance.attendance_backend.repository.CompanyHolidayRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.util.List;

@Service
public class CompanyHolidayService {
    private final CompanyHolidayRepository repository;
    public CompanyHolidayService(CompanyHolidayRepository repository) { this.repository = repository; }
    public List<CompanyHoliday> list() { return repository.findAllByOrderByHolidayDateAsc(); }
    public List<CompanyHoliday> between(LocalDate from, LocalDate to) { return repository.findByHolidayDateBetween(from, to); }
    public CompanyHoliday create(CompanyHoliday holiday) {
        validate(holiday);
        if (repository.existsByHolidayDate(holiday.getHolidayDate()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A holiday already exists on this date.");
        return repository.save(holiday);
    }
    public CompanyHoliday update(Long id, CompanyHoliday input) {
        CompanyHoliday holiday = repository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Holiday not found."));
        validate(input);
        if (!holiday.getHolidayDate().equals(input.getHolidayDate()) && repository.existsByHolidayDate(input.getHolidayDate()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A holiday already exists on this date.");
        holiday.setHolidayDate(input.getHolidayDate());
        holiday.setName(input.getName().trim());
        holiday.setDescription(input.getDescription());
        return repository.save(holiday);
    }
    public void delete(Long id) { repository.delete(repository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Holiday not found."))); }
    private void validate(CompanyHoliday holiday) {
        if (holiday.getHolidayDate() == null || holiday.getName() == null || holiday.getName().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Holiday name and date are required.");
    }
}
