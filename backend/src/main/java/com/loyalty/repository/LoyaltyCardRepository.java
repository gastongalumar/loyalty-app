package com.loyalty.repository;

import com.loyalty.entity.LoyaltyCard;
import com.loyalty.tenant.TenantAwareRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.Optional;

public interface LoyaltyCardRepository extends TenantAwareRepository<LoyaltyCard, Long> {

    @EntityGraph(attributePaths = {"user", "business"})
    Optional<LoyaltyCard> findByUserIdAndTenantId(Long userId, Long tenantId);

    @EntityGraph(attributePaths = {"user", "business"})
    Optional<LoyaltyCard> findByIdAndTenantId(Long id, Long tenantId);
}
