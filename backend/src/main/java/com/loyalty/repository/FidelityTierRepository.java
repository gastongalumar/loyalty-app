package com.loyalty.repository;

import com.loyalty.entity.Business;
import com.loyalty.entity.FidelityTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface FidelityTierRepository extends JpaRepository<FidelityTier, Long> {
    List<FidelityTier> findByBusinessAndIsActiveTrueOrderByCardsRequiredAsc(Business business);

    @Query("SELECT t FROM FidelityTier t WHERE t.business = :business AND t.cardsRequired <= :completedCards AND t.isActive = true ORDER BY t.cardsRequired DESC")
    List<FidelityTier> findEligibleTiers(@Param("business") Business business, @Param("completedCards") Integer completedCards);

    Optional<FidelityTier> findByBusinessAndCardsRequired(Business business, Integer cardsRequired);
}
