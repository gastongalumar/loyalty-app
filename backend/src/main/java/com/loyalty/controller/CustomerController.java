package com.loyalty.controller;

import com.loyalty.dto.LoyaltyCardDto;
import com.loyalty.entity.User;
import com.loyalty.repository.UserRepository;
import com.loyalty.service.FileStorageService;
import com.loyalty.service.LoyaltyCardService;
import org.springframework.boot.system.JavaVersion;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final LoyaltyCardService loyaltyCardService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;

    // ✅ DETECTAR SI ES PRODUCCIÓN (JAR) O DESARROLLO (CLASES)
    private final boolean isProduction;

    public CustomerController(LoyaltyCardService loyaltyCardService,
                              UserRepository userRepository,
                              PasswordEncoder passwordEncoder,
                              FileStorageService fileStorageService) {
        this.loyaltyCardService = loyaltyCardService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.fileStorageService = fileStorageService;

        // Si se ejecuta desde un JAR, estamos en producción
        this.isProduction = getClass().getResource("CustomerController.class").toString().startsWith("jar:");
    }

    @GetMapping("/card")
    public ResponseEntity<LoyaltyCardDto> getMyCard(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(loyaltyCardService.getLoyaltyCard(user.getId()));
    }

    @GetMapping("/qr")
    public ResponseEntity<String> getMyQrCode(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(loyaltyCardService.getQrCodeImage(user.getId()));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of(
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "email", user.getEmail(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : ""
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        try {
            String newEmail = body.get("email");
            if (newEmail != null && !newEmail.equals(user.getEmail())) {
                if (userRepository.existsByEmail(newEmail)) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "El email ya está en uso"));
                }
                user.setEmail(newEmail);
            }

            if (body.containsKey("firstName")) user.setFirstName(body.get("firstName"));
            if (body.containsKey("lastName")) user.setLastName(body.get("lastName"));
            if (body.containsKey("phone")) user.setPhone(body.get("phone"));

            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "firstName", user.getFirstName(),
                    "lastName", user.getLastName(),
                    "email", user.getEmail(),
                    "phone", user.getPhone() != null ? user.getPhone() : ""
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        try {
            String currentPassword = body.get("currentPassword");
            String newPassword = body.get("newPassword");

            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Faltan campos"));
            }

            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Contraseña actual incorrecta"));
            }

            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("error", "La contraseña debe tener al menos 6 caracteres"));
            }

            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) {
        try {
            // Guardar el archivo (esto retorna "/uploads/avatars/archivo.jpg")
            String savedPath = fileStorageService.storeFile(file, "avatars");

            // Extraer SOLO el nombre del archivo
            String filename = savedPath.substring(savedPath.lastIndexOf('/') + 1);

            // 🔥 DETECTAR AUTOMÁTICAMENTE SEGÚN CÓMO SE EJECUTA
            String fullUrl;
            if (isProduction) {
                // PRODUCCIÓN (JAR): /nuevaweb/loyalty-app/backend/uploads/avatars/x.jpg
                fullUrl = "/nuevaweb/loyalty-app/backend/uploads/avatars/" + filename;
            } else {
                // DESARROLLO (spring-boot:run): /uploads/avatars/x.jpg
                fullUrl = "/uploads/avatars/" + filename;
            }

            user.setAvatarUrl(fullUrl);
            userRepository.save(user);

            // ✅ SIEMPRE DEVOLVER LA RUTA QUE CORRESPONDE AL ENTORNO
            return ResponseEntity.ok(Map.of("url", fullUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
