package com.attendance.attendance_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "company_holidays", uniqueConstraints = @UniqueConstraint(columnNames = "holiday_date"))
public class CompanyHoliday {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "holiday_date", nullable = false, unique = true)
    private LocalDate holidayDate;
    @Column(nullable = false, length = 120)
    private String name;
    @Column(length = 500)
    private String description;
    public Long getId() { return id; }
    public LocalDate getHolidayDate() { return holidayDate; }
    public void setHolidayDate(LocalDate value) { this.holidayDate = value; }
    public String getName() { return name; }
    public void setName(String value) { this.name = value; }
    public String getDescription() { return description; }
    public void setDescription(String value) { this.description = value; }
}
