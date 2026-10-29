package com.loyalty.controller;

import com.loyalty.dto.publicapi.TenantPublicResponse;
import com.loyalty.service.PublicTenantService;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
