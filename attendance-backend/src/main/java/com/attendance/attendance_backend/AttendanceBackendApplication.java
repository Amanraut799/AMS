package com.attendance.attendance_backend;

import com.attendance.attendance_backend.entity.Role;
import com.attendance.attendance_backend.entity.User;
import com.attendance.attendance_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;

@SpringBootApplication
public class AttendanceBackendApplication {

	@Bean
	ApplicationRunner bootstrapAdmin(
			UserRepository userRepository,
			PasswordEncoder passwordEncoder,
			@Value("${app.bootstrap-admin.email:}") String email,
			@Value("${app.bootstrap-admin.password:}") String password,
			@Value("${app.bootstrap-admin.first-name:AttendPro}") String firstName,
			@Value("${app.bootstrap-admin.last-name:Admin}") String lastName) {
		return args -> {
			if (!StringUtils.hasText(email) || !StringUtils.hasText(password)) {
				return;
			}
			User admin = userRepository.findByEmailIgnoreCase(email.trim()).orElseGet(() -> {
				User newAdmin = new User();
				newAdmin.setFirstName(firstName);
				newAdmin.setLastName(lastName);
				newAdmin.setEmail(email.trim().toLowerCase(java.util.Locale.ROOT));
				newAdmin.setRole(Role.ADMIN);
				return newAdmin;
			});
			if (admin.getRole() != Role.ADMIN && admin.getRole() != Role.SUPER_ADMIN) {
				throw new IllegalStateException("Bootstrap admin email already belongs to a non-admin account");
			}
			admin.setPassword(passwordEncoder.encode(password));
			admin.setActive(true);
			userRepository.save(admin);
		};
	}

	public static void main(String[] args) {
		SpringApplication.run(AttendanceBackendApplication.class, args);
	}
}
