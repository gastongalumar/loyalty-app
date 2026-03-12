package com.loyalty.repository;

import com.loyalty.entity.Reward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RewardRepository extends JpaRepository<Reward, Long> {
    List<Reward> findByLoyaltyCardId(Long loyaltyCardId);
}
