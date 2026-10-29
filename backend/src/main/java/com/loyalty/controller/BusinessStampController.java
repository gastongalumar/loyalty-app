package com.loyalty.controller;

import com.loyalty.dto.business.AddStampRequest;
import com.loyalty.dto.business.LoyaltyCardResponse;
import com.loyalty.dto.business.ScanQrRequest;
import com.loyalty.security.SecurityUser;
import com.loyalty.service.LoyaltyCardService;
import com.loyalty.tenant.TenantContext;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/business/stamps")
public class BusinessStampController {

    private final LoyaltyCardService loyaltyCardService;

    public BusinessStampController(LoyaltyCardService loyaltyCardService) {
        this.loyaltyCardService = loyaltyCardService;
    }

    @PostMapping
    public ResponseEntity<LoyaltyCardResponse> addStamp(@Valid @RequestBody AddStampRequest request,
                                                        @AuthenticationPrincipal SecurityUser admin) {
        return ResponseEntity.ok(loyaltyCardService.addStamp(
                TenantContext.requireTenantId(), request.getUserId(), request.getNote(), admin));
    }

    @PostMapping("/scan")
    public ResponseEntity<LoyaltyCardResponse> scan(@Valid @RequestBody ScanQrRequest request,
                                                    @AuthenticationPrincipal SecurityUser admin) {
        return ResponseEntity.ok(loyaltyCardService.scanQrAndAddStamp(
                TenantContext.requireTenantId(), request.getQrCode(), request.getNote(), admin));
    }
}
