package com.loyalty.controller;

import com.loyalty.dto.business.RewardResponse;
import com.loyalty.security.SecurityUser;
import com.loyalty.service.RewardService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/rewards")
public class RewardController {

    private final RewardService rewardService;

    public RewardController(RewardService rewardService) {
        this.rewardService = rewardService;
    }

    @GetMapping
    public ResponseEntity<Page<RewardResponse>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long cardId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(rewardService.list(status, cardId, page, size));
    }

    @PostMapping("/{id}/redeem")
    public ResponseEntity<RewardResponse> redeem(@PathVariable Long id,
                                                 @AuthenticationPrincipal SecurityUser admin) {
        return ResponseEntity.ok(rewardService.redeem(id, admin));
    }
}
