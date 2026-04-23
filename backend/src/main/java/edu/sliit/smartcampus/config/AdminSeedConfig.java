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
            @Value("${app.seed.admin.password:Admin@12345}") String adminPassword,
            @Value("${app.seed.technician.email:technician@smartcampus.local}") String technicianEmail,
            @Value("${app.seed.technician.full-name:Maintenance Technician}") String technicianFullName,
            @Value("${app.seed.technician.password:Tech@12345}") String technicianPassword) {
        return args -> {
            seedLocalUser(userRepository, localCredentialService, passwordEncoder, adminEmail, adminFullName,
                    adminPassword, UserRole.ADMIN);
            seedLocalUser(userRepository, localCredentialService, passwordEncoder, technicianEmail, technicianFullName,
                    technicianPassword, UserRole.TECHNICIAN);
        };
    }

    private void seedLocalUser(
            UserRepository userRepository,
            LocalCredentialService localCredentialService,
            PasswordEncoder passwordEncoder,
            String configuredEmail,
            String configuredFullName,
            String configuredPassword,
            UserRole role) {
        String email = configuredEmail.trim().toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(email).orElseGet(User::new);
        user.setEmail(email);
        user.setFullName(configuredFullName.trim());
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(true);

        User saved = userRepository.saveAndFlush(user);
        localCredentialService.upsertPasswordHash(saved.getId(), passwordEncoder.encode(configuredPassword));
        log.info("Seeded user {} with role {}", saved.getEmail(), saved.getRole());
    }
}
