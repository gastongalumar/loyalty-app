package com.loyalty.controller;

import com.loyalty.dto.CustomerDto;
import com.loyalty.dto.LoyaltyCardDto;
import com.loyalty.entity.User;
import com.loyalty.service.LoyaltyCardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final LoyaltyCardService loyaltyCardService;

    public AdminController(LoyaltyCardService loyaltyCardService) {
        this.loyaltyCardService = loyaltyCardService;
    }

    @GetMapping("/customers")
    public ResponseEntity<List<CustomerDto>> getAllCustomers() {
        return ResponseEntity.ok(loyaltyCardService.getAllCustomers());
    }

    @GetMapping("/customers/search")
    public ResponseEntity<List<CustomerDto>> searchCustomers(@RequestParam String q) {
        return ResponseEntity.ok(loyaltyCardService.searchCustomers(q));
    }

    @GetMapping("/customers/{userId}/card")
    public ResponseEntity<LoyaltyCardDto> getCustomerCard(@PathVariable Long userId) {
        return ResponseEntity.ok(loyaltyCardService.getLoyaltyCard(userId));
    }

    @PostMapping("/stamps")
    public ResponseEntity<LoyaltyCardDto> addStamp(
            @RequestBody LoyaltyCardDto.AddStampRequest request,
            @AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(
                loyaltyCardService.addStamp(request.getUserId(), request.getNote(), admin)
        );
    }

    @PostMapping("/stamps/scan")
    public ResponseEntity<LoyaltyCardDto> scanQrAndAddStamp(
            @RequestBody LoyaltyCardDto.ScanQrRequest request,
            @AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(
                loyaltyCardService.scanQrAndAddStamp(request.getQrCode(), request.getNote(), admin)
        );
    }

    @GetMapping("/customers/{userId}/qr")
    public ResponseEntity<Map<String, String>> getCustomerQr(@PathVariable Long userId) {
        String qrImage = loyaltyCardService.getQrCodeImage(userId);
        return ResponseEntity.ok(Map.of("qrCode", qrImage));
    }
}
