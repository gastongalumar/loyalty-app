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
            if ("pending".equals(status)) {
                cardRewards = rewardRepository.findByStatus(Reward.RewardStatus.REQUESTED);
            } else if ("approved".equals(status)) {
                cardRewards = rewardRepository.findByStatus(Reward.RewardStatus.REDEEMED);
            } else {
                cardRewards = new ArrayList<>();
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
            List<FidelityReward> fidelityRewards;
            if ("pending".equals(status)) {
                fidelityRewards = fidelityRewardRepository.findByStatus(FidelityReward.RewardStatus.REQUESTED);
            } else if ("approved".equals(status)) {
                fidelityRewards = fidelityRewardRepository.findByStatus(FidelityReward.RewardStatus.REDEEMED);
            } else {
                fidelityRewards = new ArrayList<>();
            }

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
            // Intentar en Reward primero
            Reward reward = rewardRepository.findById(id).orElse(null);
            if (reward != null) {
                if (reward.getStatus() != Reward.RewardStatus.REQUESTED) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Reward not in requested state"));
                }
                reward.setStatus(Reward.RewardStatus.REDEEMED);
                reward.setApprovedAt(LocalDateTime.now());
                reward.setRedeemedAt(LocalDateTime.now());
                rewardRepository.save(reward);
                return ResponseEntity.ok(Map.of("message", "Reward approved"));
            }

            // Si no, buscar en FidelityReward
            FidelityReward fidelityReward = fidelityRewardRepository.findById(id).orElse(null);
            if (fidelityReward != null) {
                if (fidelityReward.getStatus() != FidelityReward.RewardStatus.REQUESTED) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Reward not in requested state"));
                }
                fidelityReward.setStatus(FidelityReward.RewardStatus.REDEEMED);
                fidelityReward.setApprovedAt(LocalDateTime.now());
                fidelityReward.setRedeemedAt(LocalDateTime.now());
                fidelityRewardRepository.save(fidelityReward);
                return ResponseEntity.ok(Map.of("message", "Fidelity reward approved"));
            }

            return ResponseEntity.notFound().build();

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

            // Intentar en Reward primero
            Reward reward = rewardRepository.findById(id).orElse(null);
            if (reward != null) {
                if (reward.getStatus() != Reward.RewardStatus.REQUESTED) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Reward not in requested state"));
                }
                reward.setStatus(Reward.RewardStatus.AVAILABLE);
                reward.setRejectedAt(LocalDateTime.now());
                reward.setRejectionReason(reason);
                reward.setRequestedAt(null);
                rewardRepository.save(reward);
                return ResponseEntity.ok(Map.of("message", "Reward rejected"));
            }

            // Si no, buscar en FidelityReward
            FidelityReward fidelityReward = fidelityRewardRepository.findById(id).orElse(null);
            if (fidelityReward != null) {
                if (fidelityReward.getStatus() != FidelityReward.RewardStatus.REQUESTED) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Reward not in requested state"));
                }
                fidelityReward.setStatus(FidelityReward.RewardStatus.AVAILABLE);
                fidelityReward.setRejectedAt(LocalDateTime.now());
                fidelityReward.setRejectionReason(reason);
                fidelityReward.setRequestedAt(null);
                fidelityRewardRepository.save(fidelityReward);
                return ResponseEntity.ok(Map.of("message", "Fidelity reward rejected"));
            }

            return ResponseEntity.notFound().build();

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
