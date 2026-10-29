package com.loyalty.repository;

import com.loyalty.entity.Reward;
import com.loyalty.tenant.TenantAwareRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RewardRepository extends TenantAwareRepository<Reward, Long> {

    @EntityGraph(attributePaths = {"loyaltyCard", "loyaltyCard.user"})
    List<Reward> findByLoyaltyCardIdAndTenantId(Long loyaltyCardId, Long tenantId);

    @EntityGraph(attributePaths = {"loyaltyCard", "loyaltyCard.user"})
    Page<Reward> findByTenantIdAndStatus(Long tenantId, Reward.RewardStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"loyaltyCard", "loyaltyCard.user"})
    Page<Reward> findByTenantIdAndLoyaltyCardIdAndStatus(Long tenantId, Long loyaltyCardId,
                                                       Reward.RewardStatus status, Pageable pageable);

    long countByTenantIdAndLoyaltyCardIdAndStatus(Long tenantId, Long loyaltyCardId, Reward.RewardStatus status);

    /**
     * Atomic redemption: only one concurrent request can flip AVAILABLE -> REDEEMED.
     * Returns 0 when the reward is already redeemed or belongs to another tenant.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE Reward r
               SET r.status = :redeemedStatus,
                   r.redeemedAt = :redeemedAt,
                   r.redeemedBy = :admin
             WHERE r.id = :rewardId
               AND r.tenantId = :tenantId
               AND r.status = :availableStatus
            """)
    int markRedeemed(@Param("rewardId") Long rewardId,
                     @Param("tenantId") Long tenantId,
                     @Param("admin") com.loyalty.entity.User admin,
                     @Param("redeemedAt") LocalDateTime redeemedAt,
                     @Param("redeemedStatus") Reward.RewardStatus redeemedStatus,
                     @Param("availableStatus") Reward.RewardStatus availableStatus);
}
