package com.loyalty.repository;

import com.loyalty.entity.Reward;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RewardRepository extends JpaRepository<Reward, Long> {
    List<Reward> findByLoyaltyCardId(Long loyaltyCardId);
}
