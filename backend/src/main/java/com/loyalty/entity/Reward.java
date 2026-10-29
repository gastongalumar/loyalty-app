package com.loyalty.entity;

import com.loyalty.tenant.TenantOwned;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rewards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reward implements TenantOwned {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "loyalty_card_id", nullable = false)
    private LoyaltyCard loyaltyCard;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private RewardStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime earnedAt;

    private LocalDateTime redeemedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "redeemed_by_id")
    private User redeemedBy;

    @PrePersist
    protected void onCreate() {
        earnedAt = LocalDateTime.now();
        if (status == null) {
            status = RewardStatus.AVAILABLE;
        }
    }

    public enum RewardStatus {
        AVAILABLE, REDEEMED
    }
}
