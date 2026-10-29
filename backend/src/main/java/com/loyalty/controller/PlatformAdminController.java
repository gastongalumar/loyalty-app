package com.loyalty.controller;

import com.loyalty.dto.platform.AdminResponse;
import com.loyalty.dto.platform.CreateAdminRequest;
import com.loyalty.service.PlatformService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/platform/businesses/{businessId}/admins")
public class PlatformAdminController {

    private final PlatformService platformService;

    public PlatformAdminController(PlatformService platformService) {
        this.platformService = platformService;
    }

    @PostMapping
    public ResponseEntity<AdminResponse> create(@PathVariable Long businessId,
                                                @Valid @RequestBody CreateAdminRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(platformService.createAdmin(businessId, request));
    }

    @GetMapping
    public ResponseEntity<List<AdminResponse>> list(@PathVariable Long businessId) {
        return ResponseEntity.ok(platformService.listAdmins(businessId));
    }
}
