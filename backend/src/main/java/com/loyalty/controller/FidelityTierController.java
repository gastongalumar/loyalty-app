package com.loyalty.controller;

import com.loyalty.entity.Business;
import com.loyalty.entity.FidelityTier;
import com.loyalty.entity.User;
import com.loyalty.repository.BusinessRepository;
import com.loyalty.repository.FidelityTierRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/fidelity-tiers")
public class FidelityTierController {

    private final BusinessRepository businessRepository;
    private final FidelityTierRepository fidelityTierRepository;

    public FidelityTierController(BusinessRepository businessRepository, FidelityTierRepository fidelityTierRepository) {
        this.businessRepository = businessRepository;
        this.fidelityTierRepository = fidelityTierRepository;
    }

    @GetMapping
    public ResponseEntity<?> getTiers(@AuthenticationPrincipal User owner) {
        try {
            Business business = businessRepository.findByOwner(owner)
                    .orElseThrow(() -> new RuntimeException("Business not found"));

            List<FidelityTier> tiers = fidelityTierRepository.findByBusinessAndIsActiveTrueOrderByCardsRequiredAsc(business);
            return ResponseEntity.ok(tiers);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createTier(@AuthenticationPrincipal User owner, @RequestBody FidelityTier tier) {
        try {
            Business business = businessRepository.findByOwner(owner)
                    .orElseThrow(() -> new RuntimeException("Business not found"));

            if (fidelityTierRepository.findByBusinessAndCardsRequired(business, tier.getCardsRequired()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Ya existe un nivel con " + tier.getCardsRequired() + " tarjetas"));
            }

            tier.setBusiness(business);
            tier.setId(null);
            FidelityTier saved = fidelityTierRepository.save(tier);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTier(@AuthenticationPrincipal User owner, @PathVariable Long id, @RequestBody FidelityTier tier) {
        try {
            Business business = businessRepository.findByOwner(owner)
                    .orElseThrow(() -> new RuntimeException("Business not found"));

            FidelityTier existing = fidelityTierRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Tier not found"));

            if (!existing.getBusiness().getId().equals(business.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "No tienes permiso para modificar este tier"));
            }

            existing.setCardsRequired(tier.getCardsRequired());
            existing.setRewardDescription(tier.getRewardDescription());
            existing.setIsActive(tier.getIsActive());

            FidelityTier saved = fidelityTierRepository.save(existing);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTier(@AuthenticationPrincipal User owner, @PathVariable Long id) {
        try {
            Business business = businessRepository.findByOwner(owner)
                    .orElseThrow(() -> new RuntimeException("Business not found"));

            FidelityTier tier = fidelityTierRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Tier not found"));

            if (!tier.getBusiness().getId().equals(business.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "No tienes permiso para eliminar este tier"));
            }

            fidelityTierRepository.delete(tier);
            return ResponseEntity.ok(Map.of("message", "Tier eliminado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
