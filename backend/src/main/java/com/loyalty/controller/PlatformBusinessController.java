package com.loyalty.controller;

import com.loyalty.dto.business.BusinessUpdateRequest;
import com.loyalty.dto.platform.BusinessResponse;
import com.loyalty.dto.platform.BusinessSummary;
import com.loyalty.dto.platform.CreateBusinessRequest;
import com.loyalty.dto.platform.UpdateBusinessStatusRequest;
import com.loyalty.service.PlatformService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/platform/businesses")
public class PlatformBusinessController {

    private final PlatformService platformService;

    public PlatformBusinessController(PlatformService platformService) {
        this.platformService = platformService;
    }

    @PostMapping
    public ResponseEntity<BusinessResponse> create(@Valid @RequestBody CreateBusinessRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(platformService.createBusiness(request));
    }

    @GetMapping
    public ResponseEntity<Page<BusinessSummary>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(platformService.listBusinesses(status, q, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusinessResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(platformService.getBusiness(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BusinessResponse> updateStatus(@PathVariable Long id,
                                                         @Valid @RequestBody UpdateBusinessStatusRequest request) {
        return ResponseEntity.ok(platformService.updateStatus(id, request.getStatus()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BusinessResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody BusinessUpdateRequest request) {
        return ResponseEntity.ok(platformService.updateBusiness(id, request));
    }

    @PostMapping(value = "/{id}/background", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BusinessResponse> uploadBackground(@PathVariable Long id,
                                                             @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(platformService.updateBackground(id, file));
    }

    @DeleteMapping("/{id}/background")
    public ResponseEntity<BusinessResponse> removeBackground(@PathVariable Long id) {
        return ResponseEntity.ok(platformService.removeBackground(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        platformService.softDelete(id);
        return ResponseEntity.noContent().build();
    }
}
