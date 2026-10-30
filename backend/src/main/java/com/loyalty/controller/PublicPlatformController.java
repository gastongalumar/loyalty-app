package com.loyalty.controller;

import com.loyalty.dto.platform.PlatformSettingsResponse;
import com.loyalty.service.PlatformSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/platform")
public class PublicPlatformController {

    private final PlatformSettingsService settingsService;

    public PublicPlatformController(PlatformSettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public ResponseEntity<PlatformSettingsResponse> get() {
        return ResponseEntity.ok(settingsService.get());
    }
}
