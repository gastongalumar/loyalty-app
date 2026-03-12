package com.loyalty.repository;

import com.loyalty.entity.Stamp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StampRepository extends JpaRepository<Stamp, Long> {
    List<Stamp> findByLoyaltyCardIdOrderByCreatedAtDesc(Long loyaltyCardId);
}
