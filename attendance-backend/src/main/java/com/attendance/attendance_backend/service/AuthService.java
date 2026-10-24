package com.attendance.attendance_backend.service;
import com.attendance.attendance_backend.dto.LoginRequest;
import com.attendance.attendance_backend.dto.LoginResponse;
import com.attendance.attendance_backend.entity.User;
import com.attendance.attendance_backend.repository.UserRepository;
import com.attendance.attendance_backend.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
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
        authenticationManager.authenticate( new UsernamePasswordAuthenticationToken( request.getEmail(), request.getPassword() ) );
        User user = userRepository .findByEmail(request.getEmail()) .orElseThrow(() -> new RuntimeException("User not found") );
        String token = jwtService.generateToken( user.getEmail(), user.getRole().name() );
        return new LoginResponse( token, user.getEmail(), user.getRole().name() ); }

    public User register(User user) {
    // Check if email already exists
    if (userRepository.findByEmail(user.getEmail()).isPresent()) {
        throw new RuntimeException("Email already registered");
    }

    // Convert plain-text password into BCrypt hash
    user.setPassword( passwordEncoder.encode(user.getPassword()) );
    return userRepository.save(user);
    }
}