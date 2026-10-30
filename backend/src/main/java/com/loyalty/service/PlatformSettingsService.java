package com.loyalty.service;

import com.loyalty.dto.platform.PlatformSettingsResponse;
import com.loyalty.dto.platform.PlatformSettingsUpdateRequest;
import com.loyalty.entity.PlatformSettings;
import com.loyalty.repository.PlatformSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.Objects;

@Service
public class PlatformSettingsService {

    private static final Long SETTINGS_ID = 1L;
    private static final String DEFAULT_NAME = "Loyalty Card";

    private final PlatformSettingsRepository repository;
    private final FileStorageService fileStorageService;

    public PlatformSettingsService(PlatformSettingsRepository repository,
                                   FileStorageService fileStorageService) {
        this.repository = repository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public PlatformSettingsResponse get() {
        return toResponse(repository.findById(SETTINGS_ID).orElseGet(this::defaults));
    }

    @Transactional
    public PlatformSettingsResponse update(PlatformSettingsUpdateRequest request) {
        PlatformSettings settings = loadOrCreate();

        if (request.getAppName() != null && !request.getAppName().isBlank()) {
            settings.setAppName(request.getAppName().trim());
        }
        if (request.getTagline() != null) {
            settings.setTagline(blankToNull(request.getTagline()));
        }
        if (request.getLogoUrl() != null) {
            replaceLogo(settings, request.getLogoUrl());
        }
        if (request.getBackgroundUrl() != null) {
            replaceBackground(settings, request.getBackgroundUrl());
        }
        if (request.getBackgroundVisibility() != null) {
            settings.setBackgroundVisibility(clamp(request.getBackgroundVisibility(), 0, 100));
        }
        if (request.getBackgroundBlur() != null) {
            settings.setBackgroundBlur(clamp(request.getBackgroundBlur(), 0, 24));
        }
        if (request.getColorPrimary() != null) {
            settings.setColorPrimary(request.getColorPrimary().toUpperCase(Locale.ROOT));
        }
        if (request.getColorSecondary() != null) {
            settings.setColorSecondary(request.getColorSecondary().toUpperCase(Locale.ROOT));
        }

        return toResponse(repository.save(settings));
    }

    @Transactional
    public PlatformSettingsResponse updateLogo(MultipartFile file) {
        PlatformSettings settings = loadOrCreate();
        String previous = settings.getLogoUrl();
        String uploaded = fileStorageService.storeLogo(file);
        settings.setLogoUrl(uploaded);
        PlatformSettings saved = repository.save(settings);
        if (!Objects.equals(previous, uploaded)) {
            fileStorageService.deleteManaged(previous);
        }
        return toResponse(saved);
    }

    @Transactional
    public PlatformSettingsResponse removeLogo() {
        PlatformSettings settings = loadOrCreate();
        String previous = settings.getLogoUrl();
        settings.setLogoUrl(null);
        PlatformSettings saved = repository.save(settings);
        fileStorageService.deleteManaged(previous);
        return toResponse(saved);
    }

    @Transactional
    public PlatformSettingsResponse updateBackground(MultipartFile file) {
        PlatformSettings settings = loadOrCreate();
        String previous = settings.getBackgroundUrl();
        String uploaded = fileStorageService.storeBackground(file);
        settings.setBackgroundUrl(uploaded);
        PlatformSettings saved = repository.save(settings);
        if (!Objects.equals(previous, uploaded)) {
            fileStorageService.deleteManaged(previous);
        }
        return toResponse(saved);
    }

    @Transactional
    public PlatformSettingsResponse removeBackground() {
        PlatformSettings settings = loadOrCreate();
        String previous = settings.getBackgroundUrl();
        settings.setBackgroundUrl(null);
        PlatformSettings saved = repository.save(settings);
        fileStorageService.deleteManaged(previous);
        return toResponse(saved);
    }

    private PlatformSettings loadOrCreate() {
        return repository.findById(SETTINGS_ID).orElseGet(() -> repository.save(defaults()));
    }

    private PlatformSettings defaults() {
        return PlatformSettings.builder()
                .id(SETTINGS_ID)
                .appName(DEFAULT_NAME)
                .backgroundVisibility(20)
                .backgroundBlur(8)
                .build();
    }

    private void replaceLogo(PlatformSettings settings, String next) {
        String previous = settings.getLogoUrl();
        String normalized = blankToNull(next);
        settings.setLogoUrl(normalized);
        if (!Objects.equals(previous, normalized)) {
            fileStorageService.deleteManaged(previous);
        }
    }

    private void replaceBackground(PlatformSettings settings, String next) {
        String previous = settings.getBackgroundUrl();
        String normalized = blankToNull(next);
        settings.setBackgroundUrl(normalized);
        if (!Objects.equals(previous, normalized)) {
            fileStorageService.deleteManaged(previous);
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    private PlatformSettingsResponse toResponse(PlatformSettings settings) {
        return PlatformSettingsResponse.builder()
                .appName(settings.getAppName())
                .tagline(settings.getTagline())
                .logoUrl(settings.getLogoUrl())
                .backgroundUrl(settings.getBackgroundUrl())
                .backgroundVisibility(settings.getBackgroundVisibility())
                .backgroundBlur(settings.getBackgroundBlur())
                .colorPrimary(settings.getColorPrimary())
                .colorSecondary(settings.getColorSecondary())
                .updatedAt(settings.getUpdatedAt())
                .build();
    }
}
