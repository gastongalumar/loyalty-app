package com.loyalty.controller;

import com.loyalty.dto.platform.PlatformSettingsResponse;
import com.loyalty.dto.platform.PlatformSettingsUpdateRequest;
import com.loyalty.service.PlatformSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/platform/settings")
public class PlatformSettingsController {

    private final PlatformSettingsService settingsService;

    public PlatformSettingsController(PlatformSettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public ResponseEntity<PlatformSettingsResponse> get() {
        return ResponseEntity.ok(settingsService.get());
    }

    @PutMapping
    public ResponseEntity<PlatformSettingsResponse> update(
            @Valid @RequestBody PlatformSettingsUpdateRequest request) {
        return ResponseEntity.ok(settingsService.update(request));
    }

    @PostMapping(value = "/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PlatformSettingsResponse> uploadLogo(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(settingsService.updateLogo(file));
    }

    @DeleteMapping("/logo")
    public ResponseEntity<PlatformSettingsResponse> removeLogo() {
        return ResponseEntity.ok(settingsService.removeLogo());
    }

    @PostMapping(value = "/background", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PlatformSettingsResponse> uploadBackground(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(settingsService.updateBackground(file));
    }

    @DeleteMapping("/background")
    public ResponseEntity<PlatformSettingsResponse> removeBackground() {
        return ResponseEntity.ok(settingsService.removeBackground());
    }
}
