package com.loyalty.controller;

import com.loyalty.dto.publicapi.TenantPublicResponse;
import com.loyalty.service.PublicTenantService;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/public/tenants")
@Validated
public class PublicTenantController {

    private final PublicTenantService publicTenantService;

    public PublicTenantController(PublicTenantService publicTenantService) {
        this.publicTenantService = publicTenantService;
    }

    @GetMapping("/{slug}")
    public ResponseEntity<TenantPublicResponse> getTenant(
            @PathVariable
            @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "invalid slug")
            String slug) {
        return ResponseEntity.ok(publicTenantService.getBySlug(slug));
    }

    /**
     * Per-tenant PWA manifest. The app is served from /{slug}/..., so start_url and scope
     * are tenant-prefixed and the install prompt opens the right business.
     */
    @GetMapping(value = "/{slug}/manifest.webmanifest", produces = "application/manifest+json")
    public ResponseEntity<Map<String, Object>> getManifest(
            @PathVariable
            @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "invalid slug")
            String slug) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic())
                .contentType(MediaType.parseMediaType("application/manifest+json"))
                .body(publicTenantService.getManifest(slug));
    }
}
