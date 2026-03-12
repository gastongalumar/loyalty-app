package com.loyalty.repository;

import com.loyalty.entity.Stamp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StampRepository extends JpaRepository<Stamp, Long> {
    List<Stamp> findByLoyaltyCardIdOrderByCreatedAtDesc(Long loyaltyCardId);
}
