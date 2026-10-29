package com.loyalty.controller;

import com.loyalty.dto.business.CustomerResponse;
import com.loyalty.dto.business.LoyaltyCardResponse;
import com.loyalty.service.CustomerQueryService;
import com.loyalty.service.LoyaltyCardService;
import com.loyalty.tenant.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/business/customers")
public class BusinessCustomerController {

    private final CustomerQueryService customerQueryService;
    private final LoyaltyCardService loyaltyCardService;

    public BusinessCustomerController(CustomerQueryService customerQueryService,
                                      LoyaltyCardService loyaltyCardService) {
        this.customerQueryService = customerQueryService;
        this.loyaltyCardService = loyaltyCardService;
    }

    @GetMapping
    public ResponseEntity<Page<CustomerResponse>> list(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(customerQueryService.list(q, page, size));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<CustomerResponse> get(@PathVariable Long userId) {
        return ResponseEntity.ok(customerQueryService.get(userId));
    }

    @GetMapping("/{userId}/card")
    public ResponseEntity<LoyaltyCardResponse> getCard(@PathVariable Long userId) {
        return ResponseEntity.ok(loyaltyCardService.getCard(TenantContext.requireTenantId(), userId));
    }

    @GetMapping("/{userId}/qr")
    public ResponseEntity<Map<String, String>> getQr(@PathVariable Long userId) {
        String dataUri = loyaltyCardService.getQrDataUri(TenantContext.requireTenantId(), userId);
        return ResponseEntity.ok(Map.of("qrCode", dataUri));
    }
}
