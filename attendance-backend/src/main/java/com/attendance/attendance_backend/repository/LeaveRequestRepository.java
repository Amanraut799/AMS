package com.attendance.attendance_backend.repository;
import com.attendance.attendance_backend.entity.Employee;
import com.attendance.attendance_backend.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployeeOrderByAppliedAtDesc(Employee employee);
    List<LeaveRequest> findAllByOrderByAppliedAtDesc();
    List<LeaveRequest> findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(String status, LocalDate date1, LocalDate date2);
    boolean existsByEmployeeAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(Employee employee, String status, LocalDate endDate, LocalDate startDate);
    List<LeaveRequest> findByEmployeeAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(Employee employee, String status, LocalDate endDate, LocalDate startDate);
    List<LeaveRequest> findByEmployeeInAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(List<Employee> employees, String status, LocalDate endDate, LocalDate startDate);
}
