package com.loyalty.controller;

import com.loyalty.dto.BusinessDto;
import com.loyalty.entity.User;
import com.loyalty.service.BusinessService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/business")
public class BusinessController {

    private final BusinessService businessService;

    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    @GetMapping
    public ResponseEntity<BusinessDto> getMyBusiness(@AuthenticationPrincipal User owner) {
        return ResponseEntity.ok(businessService.getMyBusiness(owner));
    }

    @PutMapping
    public ResponseEntity<BusinessDto> updateBusiness(
            @AuthenticationPrincipal User owner,
            @RequestBody BusinessDto request) {
        return ResponseEntity.ok(businessService.updateBusiness(owner, request));
    }
}
