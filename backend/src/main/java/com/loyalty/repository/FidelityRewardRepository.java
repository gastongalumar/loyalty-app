package com.loyalty.repository;

import com.loyalty.entity.FidelityReward;
import com.loyalty.entity.LoyaltyCard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FidelityRewardRepository extends JpaRepository<FidelityReward, Long> {
    List<FidelityReward> findByLoyaltyCardOrderByEarnedAtDesc(LoyaltyCard loyaltyCard);
    List<FidelityReward> findByLoyaltyCardAndStatus(LoyaltyCard loyaltyCard, FidelityReward.RewardStatus status);
    List<FidelityReward> findByStatus(FidelityReward.RewardStatus status);  // ← AGREGAR ESTA LÍNEA
}
