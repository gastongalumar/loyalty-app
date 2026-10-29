package com.loyalty.controller;

import com.loyalty.dto.business.BusinessUpdateRequest;
import com.loyalty.dto.platform.BusinessResponse;
import com.loyalty.service.BusinessService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/business/me")
public class BusinessController {

    private final BusinessService businessService;

    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    @GetMapping
    public ResponseEntity<BusinessResponse> getMyBusiness() {
        return ResponseEntity.ok(businessService.getMyBusiness());
    }

    @PutMapping
    public ResponseEntity<BusinessResponse> updateMyBusiness(
            @Valid @RequestBody BusinessUpdateRequest request) {
        return ResponseEntity.ok(businessService.updateMyBusiness(request));
    }
}
