package com.attendance.attendance_backend.service;
import com.attendance.attendance_backend.dto.LoginRequest;
import com.attendance.attendance_backend.dto.LoginResponse;
import com.attendance.attendance_backend.entity.Role;
import com.attendance.attendance_backend.entity.User;
import com.attendance.attendance_backend.repository.UserRepository;
import com.attendance.attendance_backend.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Locale;
@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    public AuthService(
                        AuthenticationManager authenticationManager,
                        UserRepository userRepository,
                        JwtService jwtService,
                        PasswordEncoder passwordEncoder )
                {this.authenticationManager = authenticationManager;
                this.userRepository = userRepository;
                this.jwtService = jwtService;
                this.passwordEncoder = passwordEncoder; }

    public LoginResponse login(LoginRequest request)
    {
        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);
        authenticationManager.authenticate( new UsernamePasswordAuthenticationToken( normalizedEmail, request.getPassword() ) );
        User user = userRepository .findByEmailIgnoreCase(normalizedEmail) .orElseThrow(() -> new RuntimeException("User not found") );
        String token = jwtService.generateToken( user.getEmail(), user.getRole().name() );
        return new LoginResponse( token, user.getEmail(), user.getRole().name() ); }

    public User register(User user) {
    // Check if email already exists
    if (userRepository.findByEmailIgnoreCase(user.getEmail()).isPresent()) {
        throw new RuntimeException("Email already registered");
    }

    // Public registration must never allow a caller to grant themselves admin access.
    user.setRole(Role.EMPLOYEE);
    user.setEmail(user.getEmail().trim().toLowerCase(Locale.ROOT));

    // Convert plain-text password into BCrypt hash
    user.setPassword( passwordEncoder.encode(user.getPassword()) );
    return userRepository.save(user);
    }
}
