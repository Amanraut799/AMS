package com.attendance.attendance_backend.controller;

import com.attendance.attendance_backend.dto.LoginRequest;
import com.attendance.attendance_backend.dto.LoginResponse;
import com.attendance.attendance_backend.dto.ForgotPasswordRequest;
import com.attendance.attendance_backend.dto.ResetPasswordRequest;
import com.attendance.attendance_backend.entity.User;
import com.attendance.attendance_backend.service.AuthService;
import com.attendance.attendance_backend.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(
            @RequestBody User user
    ) {

        User registeredUser =
                authService.register(user);

        // Never return the password to the client
        registeredUser.setPassword(null);

        return ResponseEntity.status(201).body(registeredUser);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request
    ) {

        LoginResponse response =
                authService.login(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        passwordResetService.requestReset(request.email());
        return ResponseEntity.ok(Map.of(
                "message",
                "If an active employee account exists for that email, a password reset link has been sent."
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        passwordResetService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(Map.of("message", "Your password has been reset. You can now sign in."));
    }
}
