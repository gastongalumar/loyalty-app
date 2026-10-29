package com.loyalty.repository;

import com.loyalty.entity.Stamp;
import com.loyalty.tenant.TenantAwareRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;

public interface StampRepository extends TenantAwareRepository<Stamp, Long> {

    @EntityGraph(attributePaths = {"addedBy"})
    List<Stamp> findByLoyaltyCardIdAndTenantIdOrderByCreatedAtDesc(Long loyaltyCardId, Long tenantId);
}
