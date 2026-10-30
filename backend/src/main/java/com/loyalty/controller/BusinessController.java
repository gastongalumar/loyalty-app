package com.loyalty.controller;

import com.loyalty.dto.business.BusinessUpdateRequest;
import com.loyalty.dto.platform.BusinessResponse;
import com.loyalty.service.BusinessService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping(value = "/background", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BusinessResponse> uploadBackground(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(businessService.updateBackground(file));
    }

    @DeleteMapping("/background")
    public ResponseEntity<BusinessResponse> removeBackground() {
        return ResponseEntity.ok(businessService.removeBackground());
    }
}
