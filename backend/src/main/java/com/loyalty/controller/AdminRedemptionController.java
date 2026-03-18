package com.loyalty.controller;

import com.loyalty.entity.*;
import com.loyalty.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/redemptions")
public class AdminRedemptionController {

    private final RewardRepository rewardRepository;
    private final FidelityRewardRepository fidelityRewardRepository;
    private final LoyaltyCardRepository loyaltyCardRepository;

    public AdminRedemptionController(
            RewardRepository rewardRepository,
            FidelityRewardRepository fidelityRewardRepository,
            LoyaltyCardRepository loyaltyCardRepository) {
        this.rewardRepository = rewardRepository;
        this.fidelityRewardRepository = fidelityRewardRepository;
        this.loyaltyCardRepository = loyaltyCardRepository;
    }

    @GetMapping
    public ResponseEntity<?> getRedemptions(
            @AuthenticationPrincipal User admin,
            @RequestParam(required = false, defaultValue = "pending") String status) {

        try {
            List<Map<String, Object>> result = new ArrayList<>();

            // Buscar rewards de tarjetas
            List<Reward> cardRewards;
            List<FidelityReward> fidelityRewards;
            switch (status) {
                case "pending" -> {
                    cardRewards = rewardRepository.findByStatus(Reward.RewardStatus.REQUESTED);
                    fidelityRewards = fidelityRewardRepository.findByStatus(FidelityReward.RewardStatus.REQUESTED);
                }
                case "approved" -> {
                    cardRewards = rewardRepository.findByStatus(Reward.RewardStatus.REDEEMED);
                    fidelityRewards = fidelityRewardRepository.findByStatus(FidelityReward.RewardStatus.REDEEMED);
                }
                case "rejected" -> {
                    cardRewards = rewardRepository.findByStatus(Reward.RewardStatus.REJECTED);
                    fidelityRewards = fidelityRewardRepository.findByStatus(FidelityReward.RewardStatus.REJECTED);
                }
                default -> {
                    cardRewards = new ArrayList<>();
                    fidelityRewards = new ArrayList<>();
                }
            }

            for (Reward r : cardRewards) {
                LoyaltyCard card = r.getLoyaltyCard();
                result.add(Map.of(
                        "id", r.getId(),
                        "type", "CARD",
                        "customerName", card.getUser().getFirstName() + " " + card.getUser().getLastName(),
                        "customerEmail", card.getUser().getEmail(),
                        "description", r.getDescription(),
                        "requestedAt", r.getRequestedAt(),
                        "status", r.getStatus().name()
                ));
            }

            // Buscar rewards de fidelidad
            for (FidelityReward fr : fidelityRewards) {
                LoyaltyCard card = fr.getLoyaltyCard();
                result.add(Map.of(
                        "id", fr.getId(),
                        "type", "FIDELITY",
                        "customerName", card.getUser().getFirstName() + " " + card.getUser().getLastName(),
                        "customerEmail", card.getUser().getEmail(),
                        "description", fr.getDescription(),
                        "requestedAt", fr.getRequestedAt(),
                        "status", fr.getStatus().name(),
                        "cardsRequired", fr.getTier().getCardsRequired()
                ));
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveRedemption(
            @AuthenticationPrincipal User admin,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body) {

        try {
            String rewardType = body != null ? (String) body.get("rewardType") : null;
            if ("FIDELITY".equals(rewardType)) {
                FidelityReward fr = fidelityRewardRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Fidelity reward not found: " + id));
                if (fr.getStatus() != FidelityReward.RewardStatus.REQUESTED) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "The reward is not in requested state"));
                }
                fr.setStatus(FidelityReward.RewardStatus.REDEEMED);
                fr.setApprovedAt(LocalDateTime.now());
                fr.setRedeemedAt(LocalDateTime.now());
                fidelityRewardRepository.save(fr);
                return ResponseEntity.ok(Map.of("message", "Fidelity reward approved"));
            } else {
                Reward reward = rewardRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Reward not found: " + id));
                if (reward.getStatus() != Reward.RewardStatus.REQUESTED) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "The reward is not in requested state"));
                }
                reward.setStatus(Reward.RewardStatus.REDEEMED);
                reward.setApprovedAt(LocalDateTime.now());
                reward.setRedeemedAt(LocalDateTime.now());
                rewardRepository.save(reward);
                return ResponseEntity.ok(Map.of("message", "Reward approved"));
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectRedemption(
            @AuthenticationPrincipal User admin,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {

        try {
            String reason = body != null ? body.get("reason") : null;
            String rewardType = body != null ? body.get("rewardType") : null;
            if ("FIDELITY".equals(rewardType)) {
                FidelityReward fr = fidelityRewardRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Fidelity reward not found: " + id));
                if (fr.getStatus() != FidelityReward.RewardStatus.REQUESTED) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "The reward is not in requested state"));
                }
                fr.setStatus(FidelityReward.RewardStatus.REJECTED);
                fr.setRejectedAt(LocalDateTime.now());
                fr.setRejectionReason(reason);
                fr.setRequestedAt(null);
                fidelityRewardRepository.save(fr);
                return ResponseEntity.ok(Map.of("message", "Fidelity reward rejected"));
            } else {
                Reward reward = rewardRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Reward not found: " + id));
                if (reward.getStatus() != Reward.RewardStatus.REQUESTED) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "The reward is not in requested state"));
                }
                reward.setStatus(Reward.RewardStatus.REJECTED);
                reward.setRejectedAt(LocalDateTime.now());
                reward.setRejectionReason(reason);
                reward.setRequestedAt(null);
                rewardRepository.save(reward);
                return ResponseEntity.ok(Map.of("message", "Reward rejected"));
            }


        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
