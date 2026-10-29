package com.loyalty.controller;

import com.loyalty.dto.business.LoyaltyCardResponse;
import com.loyalty.security.SecurityUser;
import com.loyalty.service.LoyaltyCardService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/customer")
public class CustomerController {

    private final LoyaltyCardService loyaltyCardService;

    public CustomerController(LoyaltyCardService loyaltyCardService) {
        this.loyaltyCardService = loyaltyCardService;
    }

    @GetMapping("/card")
    public ResponseEntity<LoyaltyCardResponse> getMyCard(@AuthenticationPrincipal SecurityUser user) {
        return ResponseEntity.ok(loyaltyCardService.getMyCard(user));
    }

    @GetMapping(value = "/qr", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getMyQrCode(@AuthenticationPrincipal SecurityUser user) {
        return ResponseEntity.ok(loyaltyCardService.getQrDataUri(user.getTenantId(), user.getId()));
    }
}
