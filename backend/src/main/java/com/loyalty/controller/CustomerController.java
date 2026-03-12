package com.loyalty.controller;

import com.loyalty.dto.LoyaltyCardDto;
import com.loyalty.entity.User;
import com.loyalty.service.LoyaltyCardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final LoyaltyCardService loyaltyCardService;

    public CustomerController(LoyaltyCardService loyaltyCardService) {
        this.loyaltyCardService = loyaltyCardService;
    }

    @GetMapping("/card")
    public ResponseEntity<LoyaltyCardDto> getMyCard(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(loyaltyCardService.getLoyaltyCard(user.getId()));
    }

    @GetMapping("/qr")
    public ResponseEntity<String> getMyQrCode(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(loyaltyCardService.getQrCodeImage(user.getId()));
    }
}
