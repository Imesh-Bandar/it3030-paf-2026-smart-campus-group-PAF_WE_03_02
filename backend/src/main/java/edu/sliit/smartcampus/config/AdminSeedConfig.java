package edu.sliit.smartcampus.config;

import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import edu.sliit.smartcampus.model.User;
import edu.sliit.smartcampus.model.UserRole;
import edu.sliit.smartcampus.model.UserStatus;
import edu.sliit.smartcampus.repository.UserRepository;
import edu.sliit.smartcampus.service.LocalCredentialService;

@Configuration
public class AdminSeedConfig {

    private static final Logger log = LoggerFactory.getLogger(AdminSeedConfig.class);

    @Bean
    CommandLineRunner seedAdminUser(
            UserRepository userRepository,
            LocalCredentialService localCredentialService,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed.admin.email:admin@smartcampus.local}") String adminEmail,
            @Value("${app.seed.admin.full-name:System Administrator}") String adminFullName,
            @Value("${app.seed.admin.password:Admin@12345}") String adminPassword) {
        return args -> {
            String email = adminEmail.trim().toLowerCase(Locale.ROOT);

            User admin = userRepository.findByEmail(email).orElseGet(User::new);
            admin.setEmail(email);
            admin.setFullName(adminFullName.trim());
            admin.setRole(UserRole.ADMIN);
            admin.setStatus(UserStatus.ACTIVE);
            admin.setEmailVerified(true);
            admin.setAvatarUrl(admin.getAvatarUrl());

            User saved = userRepository.saveAndFlush(admin);
            localCredentialService.upsertPasswordHash(saved.getId(), passwordEncoder.encode(adminPassword));
            log.info("Seeded admin user {} with role {}", saved.getEmail(), saved.getRole());
        };
    }
}
