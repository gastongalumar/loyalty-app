package com.loyalty.controller;

import com.loyalty.entity.Business;
import com.loyalty.entity.BusinessTheme;
import com.loyalty.entity.User;
import com.loyalty.repository.BusinessRepository;
import com.loyalty.repository.BusinessThemeRepository;
import com.loyalty.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/theme")
public class ThemeController {

    private final BusinessRepository businessRepository;
    private final BusinessThemeRepository themeRepository;
    private final FileStorageService fileStorageService;

    public ThemeController(BusinessRepository businessRepository,
                           BusinessThemeRepository themeRepository,
                           FileStorageService fileStorageService) {
        this.businessRepository = businessRepository;
        this.themeRepository = themeRepository;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/public")
    public ResponseEntity<?> getPublicTheme() {
        try {
            Business business = businessRepository.findAll()
                    .stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No business found"));

            BusinessTheme theme = themeRepository.findByBusiness(business)
                    .orElseGet(() -> {
                        BusinessTheme newTheme = new BusinessTheme();
                        newTheme.setBusiness(business);
                        return themeRepository.save(newTheme);
                    });

            return ResponseEntity.ok(theme);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getTheme(@AuthenticationPrincipal User owner) {
        try {
            if (owner == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Usuario no autenticado"));
            }

            Business business = businessRepository.findByOwner(owner)
                    .orElseThrow(() -> new RuntimeException("Business not found for user: " + owner.getEmail()));

            BusinessTheme theme = themeRepository.findByBusiness(business)
                    .orElseGet(() -> {
                        BusinessTheme newTheme = new BusinessTheme();
                        newTheme.setBusiness(business);
                        return themeRepository.save(newTheme);
                    });

            return ResponseEntity.ok(theme);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", e.getMessage(),
                    "type", e.getClass().getSimpleName()
            ));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateTheme(
            @AuthenticationPrincipal User owner,
            @RequestBody BusinessTheme updatedTheme) {

        try {
            if (owner == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Usuario no autenticado"));
            }

            Business business = businessRepository.findByOwner(owner)
                    .orElseThrow(() -> new RuntimeException("Business not found for user: " + owner.getEmail()));

            BusinessTheme theme = themeRepository.findByBusiness(business)
                    .orElse(new BusinessTheme());

            theme.setBusiness(business);
            theme.setMode(updatedTheme.getMode());
            theme.setPrimaryColor(updatedTheme.getPrimaryColor());
            theme.setSecondaryColor(updatedTheme.getSecondaryColor());
            theme.setAccentColor(updatedTheme.getAccentColor());
            theme.setFontFamily(updatedTheme.getFontFamily());
            theme.setAppName(updatedTheme.getAppName());
            theme.setLogoSize(updatedTheme.getLogoSize());
            theme.setNameSize(updatedTheme.getNameSize());
            theme.setNavbarTextColor(updatedTheme.getNavbarTextColor());
            theme.setBackgroundSize(updatedTheme.getBackgroundSize());
            theme.setBackgroundBlur(updatedTheme.getBackgroundBlur());
            theme.setCardOpacity(updatedTheme.getCardOpacity());

            // 🔥 NUEVAS PROPIEDADES - AGREGADAS AQUÍ 🔥
            theme.setBodyTextColor(updatedTheme.getBodyTextColor());
            theme.setHeadingTextColor(updatedTheme.getHeadingTextColor());
            theme.setBodyFontSize(updatedTheme.getBodyFontSize());
            theme.setLoginLogoSize(updatedTheme.getLoginLogoSize());

            // IMPORTANTE: NO tocamos logoUrl ni backgroundUrl aquí

            BusinessTheme saved = themeRepository.save(theme);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", e.getMessage(),
                    "type", e.getClass().getSimpleName()
            ));
        }
    }

    @PostMapping("/upload-logo")
    public ResponseEntity<?> uploadLogo(
            @AuthenticationPrincipal User owner,
            @RequestParam("file") MultipartFile file) {

        try {
            if (owner == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Usuario no autenticado"));
            }

            Business business = businessRepository.findByOwner(owner)
                    .orElseThrow(() -> new RuntimeException("Business not found for user: " + owner.getEmail()));

            String fileUrl = fileStorageService.storeFile(file, "logos");

            BusinessTheme theme = themeRepository.findByBusiness(business)
                    .orElse(new BusinessTheme());

            if (theme.getLogoUrl() != null && !theme.getLogoUrl().isEmpty()) {
                fileStorageService.deleteFile(theme.getLogoUrl());
            }

            theme.setBusiness(business);
            theme.setLogoUrl(fileUrl);
            themeRepository.save(theme);

            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", e.getMessage(),
                    "type", e.getClass().getSimpleName()
            ));
        }
    }

    @PostMapping("/upload-background")
    public ResponseEntity<?> uploadBackground(
            @AuthenticationPrincipal User owner,
            @RequestParam("file") MultipartFile file) {

        try {
            if (owner == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Usuario no autenticado"));
            }

            Business business = businessRepository.findByOwner(owner)
                    .orElseThrow(() -> new RuntimeException("Business not found for user: " + owner.getEmail()));

            String fileUrl = fileStorageService.storeFile(file, "backgrounds");

            BusinessTheme theme = themeRepository.findByBusiness(business)
                    .orElse(new BusinessTheme());

            if (theme.getBackgroundUrl() != null && !theme.getBackgroundUrl().isEmpty()) {
                fileStorageService.deleteFile(theme.getBackgroundUrl());
            }

            theme.setBusiness(business);
            theme.setBackgroundUrl(fileUrl);
            themeRepository.save(theme);

            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", e.getMessage(),
                    "type", e.getClass().getSimpleName()
            ));
        }
    }

    @DeleteMapping("/remove-logo")
    public ResponseEntity<?> removeLogo(@AuthenticationPrincipal User owner) {
        try {
            Business business = businessRepository.findByOwner(owner)
                    .orElseThrow(() -> new RuntimeException("Business not found"));

            BusinessTheme theme = themeRepository.findByBusiness(business)
                    .orElseThrow(() -> new RuntimeException("Theme not found"));

            if (theme.getLogoUrl() != null && !theme.getLogoUrl().isEmpty()) {
                fileStorageService.deleteFile(theme.getLogoUrl());
            }

            theme.setLogoUrl("");
            themeRepository.save(theme);

            return ResponseEntity.ok(Map.of("message", "Logo removed successfully"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/remove-background")
    public ResponseEntity<?> removeBackground(@AuthenticationPrincipal User owner) {
        try {
            Business business = businessRepository.findByOwner(owner)
                    .orElseThrow(() -> new RuntimeException("Business not found"));

            BusinessTheme theme = themeRepository.findByBusiness(business)
                    .orElseThrow(() -> new RuntimeException("Theme not found"));

            if (theme.getBackgroundUrl() != null && !theme.getBackgroundUrl().isEmpty()) {
                fileStorageService.deleteFile(theme.getBackgroundUrl());
            }

            theme.setBackgroundUrl("");
            themeRepository.save(theme);

            return ResponseEntity.ok(Map.of("message", "Background removed successfully"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
