package com.loyalty.controller;

import com.loyalty.dto.RewardRedemptionDto;
import com.loyalty.entity.*;
import com.loyalty.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/redemptions")
public class RewardRedemptionController {

    private final RewardRepository rewardRepository;
    private final FidelityRewardRepository fidelityRewardRepository;

    public RewardRedemptionController(
            RewardRepository rewardRepository,
            FidelityRewardRepository fidelityRewardRepository) {
        this.rewardRepository = rewardRepository;
        this.fidelityRewardRepository = fidelityRewardRepository;
    }

    @PostMapping("/request")
    public ResponseEntity<?> requestRedemption(
            @AuthenticationPrincipal User customer,
            @RequestBody RewardRedemptionDto.Request request) {

        try {
            if ("CARD".equals(request.getRewardType())) {
                Reward reward = rewardRepository.findById(request.getRewardId())
                        .orElseThrow(() -> new RuntimeException("Reward not found"));

                // Verificar que sea del cliente
                if (!reward.getLoyaltyCard().getUser().getId().equals(customer.getId())) {
                    return ResponseEntity.status(403).body(Map.of("error", "Not your reward"));
                }

                // Verificar que esté disponible
                if (reward.getStatus() != Reward.RewardStatus.AVAILABLE) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Reward not available"));
                }

                reward.setRequestedAt(LocalDateTime.now());
                reward.setStatus(Reward.RewardStatus.REQUESTED);
                rewardRepository.save(reward);

                return ResponseEntity.ok(new RewardRedemptionDto.Response(
                        reward.getId(), "PENDING", "Redemption requested successfully"));

            } else if ("FIDELITY".equals(request.getRewardType())) {
                FidelityReward reward = fidelityRewardRepository.findById(request.getRewardId())
                        .orElseThrow(() -> new RuntimeException("Fidelity reward not found"));

                if (!reward.getLoyaltyCard().getUser().getId().equals(customer.getId())) {
                    return ResponseEntity.status(403).body(Map.of("error", "Not your reward"));
                }

                if (reward.getStatus() != FidelityReward.RewardStatus.AVAILABLE) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Reward not available"));
                }

                reward.setRequestedAt(LocalDateTime.now());
                reward.setStatus(FidelityReward.RewardStatus.REQUESTED);
                fidelityRewardRepository.save(reward);

                return ResponseEntity.ok(new RewardRedemptionDto.Response(
                        reward.getId(), "PENDING", "Redemption requested successfully"));
            }

            return ResponseEntity.badRequest().body(Map.of("error", "Invalid reward type"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
