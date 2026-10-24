package com.attendance.attendance_backend.service;

import com.attendance.attendance_backend.entity.Employee;
import com.attendance.attendance_backend.entity.WorkArea;
import com.attendance.attendance_backend.repository.WorkAreaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class WorkAreaService {
    private final WorkAreaRepository repository;
    public WorkAreaService(WorkAreaRepository repository) { this.repository = repository; }

    public List<WorkArea> list() { return repository.findAllByOrderByNameAsc(); }

    public WorkArea save(WorkArea area) {
        validate(area);
        if (area.getId() != null && !repository.existsById(area.getId()))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Work area not found");
        return repository.save(area);
    }

    public WorkArea update(Long id, WorkArea update) {
        WorkArea area = repository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Work area not found"));
        area.setName(update.getName());
        area.setAreaType(update.getAreaType());
        area.setLatitude(update.getLatitude());
        area.setLongitude(update.getLongitude());
        area.setRadiusMeters(update.getRadiusMeters());
        area.setActive(update.isActive());
        validate(area);
        return repository.save(area);
    }

    public void deactivate(Long id) {
        WorkArea area = repository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Work area not found"));
        area.setActive(false);
        repository.save(area);
    }

    public WorkArea validateAttendanceLocation(Employee employee, double latitude, double longitude, double accuracy) {
        if (!Double.isFinite(latitude) || !Double.isFinite(longitude) || !Double.isFinite(accuracy)
                || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180 || accuracy < 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A valid GPS location is required");
        boolean fieldEmployee = "FIELD".equalsIgnoreCase(employee.getEmployeeType());
        List<WorkArea> eligibleAreas = repository.findByActiveTrue().stream()
                .filter(area -> fieldEmployee || "OFFICE".equals(area.getAreaType()))
                .toList();

        for (WorkArea area : eligibleAreas) {
            double distance = distanceMeters(latitude, longitude, area.getLatitude(), area.getLongitude());
            if (distance <= area.getRadiusMeters()) {
                // Indoor or desktop location providers can be less precise than phone GPS.
                // Keep the accepted uncertainty bounded by both the zone size and 250 m.
                double maxAccuracy = Math.min(250, area.getRadiusMeters());
                if (accuracy > maxAccuracy) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            String.format("Your location accuracy is about ±%.0f m; this area requires ±%.0f m or better. Enable precise location and try again near a window or outdoors.", accuracy, maxAccuracy));
                }
                return area;
            }
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                eligibleAreas.isEmpty()
                        ? "No approved attendance area is configured for your employee type. Contact your administrator."
                        : "Your reported location is outside the approved attendance areas.");
    }

    private void validate(WorkArea area) {
        if (area.getName() == null || area.getName().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Work area name is required");
        if (!"OFFICE".equals(area.getAreaType()) && !"FIELD".equals(area.getAreaType()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Area type must be OFFICE or FIELD");
        if (!Double.isFinite(area.getLatitude()) || area.getLatitude() < -90 || area.getLatitude() > 90
                || !Double.isFinite(area.getLongitude()) || area.getLongitude() < -180 || area.getLongitude() > 180)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter valid latitude and longitude");
        if (area.getRadiusMeters() < 25 || area.getRadiusMeters() > 20000)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Radius must be between 25 and 20000 meters");
    }

    private double distanceMeters(double lat1, double lon1, double lat2, double lon2) {
        double earthRadius = 6_371_000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
