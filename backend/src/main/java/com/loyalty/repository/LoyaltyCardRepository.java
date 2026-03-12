package com.loyalty.repository;

import com.loyalty.entity.LoyaltyCard;
import com.loyalty.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LoyaltyCardRepository extends JpaRepository<LoyaltyCard, Long> {
    Optional<LoyaltyCard> findByUser(User user);
    Optional<LoyaltyCard> findByUserId(Long userId);
}
