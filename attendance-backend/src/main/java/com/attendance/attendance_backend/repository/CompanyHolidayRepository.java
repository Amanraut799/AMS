package com.attendance.attendance_backend.repository;
import com.attendance.attendance_backend.entity.CompanyHoliday;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
public interface CompanyHolidayRepository extends JpaRepository<CompanyHoliday, Long> {
    List<CompanyHoliday> findAllByOrderByHolidayDateAsc();
    List<CompanyHoliday> findByHolidayDateBetween(LocalDate from, LocalDate to);
    boolean existsByHolidayDate(LocalDate holidayDate);
}
