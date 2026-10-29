package com.loyalty.config;

import com.loyalty.entity.User;
import com.loyalty.repository.UserRepository;
import com.loyalty.service.QrCodeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates the first PLATFORM_ADMIN from environment variables.
 * There is no public endpoint that can create one.
 */
@Component
public class PlatformAdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PlatformAdminBootstrap.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final QrCodeService qrCodeService;

    @Value("${app.bootstrap.platform-admin-email:}")
    private String adminEmail;

    @Value("${app.bootstrap.platform-admin-password:}")
    private String adminPassword;

    public PlatformAdminBootstrap(UserRepository userRepository,
                                  PasswordEncoder passwordEncoder,
                                  QrCodeService qrCodeService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.qrCodeService = qrCodeService;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (adminEmail == null || adminEmail.isBlank()
                || adminPassword == null || adminPassword.isBlank()) {
            log.warn("PLATFORM_ADMIN bootstrap skipped: APP_BOOTSTRAP_PLATFORM_ADMIN_EMAIL/PASSWORD not set");
            return;
        }

        String email = adminEmail.trim().toLowerCase();
        if (userRepository.findByEmailAndRole(email, User.Role.PLATFORM_ADMIN).isPresent()) {
            log.info("PLATFORM_ADMIN {} already exists, bootstrap skipped", email);
            return;
        }

        User admin = User.builder()
                .email(email)
                .password(passwordEncoder.encode(adminPassword))
                .firstName("Platform")
                .lastName("Admin")
                .role(User.Role.PLATFORM_ADMIN)
                .qrCode(qrCodeService.generateQrCodeId())
                .build();

        userRepository.save(admin);
        log.info("PLATFORM_ADMIN {} created", email);
    }
}
