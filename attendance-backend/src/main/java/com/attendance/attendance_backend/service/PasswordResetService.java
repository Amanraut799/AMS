package com.attendance.attendance_backend.service;

import com.attendance.attendance_backend.entity.PasswordResetToken;
import com.attendance.attendance_backend.entity.Role;
import com.attendance.attendance_backend.entity.User;
import com.attendance.attendance_backend.repository.PasswordResetTokenRepository;
import com.attendance.attendance_backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class PasswordResetService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);
    private static final int TOKEN_EXPIRATION_MINUTES = 15;

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final RestClient restClient = RestClient.create();
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${RESEND_API_KEY:}")
    private String resendApiKey;

    @Value("${app.mail.from:no-reply@attendpro.local}")
    private String senderAddress;

    @Value("${app.password-reset-url:http://localhost:5173/reset-password}")
    private String resetUrl;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            ObjectProvider<JavaMailSender> mailSenderProvider
    ) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSenderProvider = mailSenderProvider;
    }

    @Transactional
    public void requestReset(String email) {
        boolean apiMailConfigured = resendApiKey != null && !resendApiKey.isBlank();
        boolean smtpConfigured = mailHost != null && !mailHost.isBlank()
                && mailSenderProvider.getIfAvailable() != null;
        if (!apiMailConfigured && !smtpConfigured) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Password reset email is not configured. Contact your administrator."
            );
        }

        userRepository.findByEmailIgnoreCaseAndRole(email.trim(), Role.EMPLOYEE)
                .filter(User::isActive)
                .ifPresent(this::sendResetEmail);
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByTokenHash(hashToken(rawToken))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "This password reset link is invalid or expired. Request a new link."
                ));

        if (!resetToken.getExpiresAt().isAfter(LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This password reset link is invalid or expired. Request a new link."
            );
        }

        User user = userRepository.findById(resetToken.getUserId())
                .filter(existingUser -> existingUser.getRole() == Role.EMPLOYEE && existingUser.isActive())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "This password reset link is invalid or expired. Request a new link."
                ));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokenRepository.deleteByUserId(user.getId());
    }

    private void sendResetEmail(User user) {
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

        tokenRepository.deleteByUserId(user.getId());

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUserId(user.getId());
        resetToken.setTokenHash(hashToken(rawToken));
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(TOKEN_EXPIRATION_MINUTES));
        tokenRepository.save(resetToken);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderAddress);
        message.setTo(user.getEmail());
        message.setSubject("Reset your AttendPro password");
        message.setText("Hello " + user.getFirstName() + ",\n\n"
                + "Use the link below to reset your AttendPro password. It expires in 15 minutes and can only be used once.\n\n"
                + resetUrl + "?token=" + rawToken + "\n\n"
                + "If you did not request this, you can ignore this email.");

        try {
            if (resendApiKey != null && !resendApiKey.isBlank()) {
                restClient.post()
                        .uri("https://api.resend.com/emails")
                        .header("Authorization", "Bearer " + resendApiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(java.util.Map.of(
                                "from", senderAddress,
                                "to", java.util.List.of(user.getEmail()),
                                "subject", "Reset your AttendPro password",
                                "text", message.getText()
                        ))
                        .retrieve()
                        .toBodilessEntity();
            } else {
                mailSenderProvider.getObject().send(message);
            }
        } catch (RuntimeException exception) {
            logger.error("Unable to send password reset email for employee account", exception);
            tokenRepository.deleteByUserId(user.getId());
        }
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to process password reset token", exception);
        }
    }
}
