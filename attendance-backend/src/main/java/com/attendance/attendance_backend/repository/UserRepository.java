package com.attendance.attendance_backend.repository;

import com.attendance.attendance_backend.entity.User;
import com.attendance.attendance_backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByEmailIgnoreCaseAndRole(String email, Role role);

    boolean existsByEmail(String email);

}
