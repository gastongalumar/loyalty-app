package com.loyalty.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rewards")
public class Reward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loyalty_card_id", nullable = false)
    private LoyaltyCard loyaltyCard;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RewardStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime earnedAt;

    private LocalDateTime redeemedAt;

    private LocalDateTime requestedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;
    private String rejectionReason;

    public Reward() {}

    public Reward(Long id, LoyaltyCard loyaltyCard, String description, RewardStatus status, LocalDateTime earnedAt, LocalDateTime redeemedAt) {
        this.id = id;
        this.loyaltyCard = loyaltyCard;
        this.description = description;
        this.status = status;
        this.earnedAt = earnedAt;
        this.redeemedAt = redeemedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LoyaltyCard getLoyaltyCard() { return loyaltyCard; }
    public void setLoyaltyCard(LoyaltyCard loyaltyCard) { this.loyaltyCard = loyaltyCard; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public RewardStatus getStatus() { return status; }
    public void setStatus(RewardStatus status) { this.status = status; }

    public LocalDateTime getEarnedAt() { return earnedAt; }
    public void setEarnedAt(LocalDateTime earnedAt) { this.earnedAt = earnedAt; }

    public LocalDateTime getRedeemedAt() { return redeemedAt; }
    public void setRedeemedAt(LocalDateTime redeemedAt) { this.redeemedAt = redeemedAt; }


    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public LocalDateTime getRejectedAt() {
        return rejectedAt;
    }

    public void setRejectedAt(LocalDateTime rejectedAt) {
        this.rejectedAt = rejectedAt;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    @PrePersist
    protected void onCreate() {
        earnedAt = LocalDateTime.now();
    }

    public enum RewardStatus {
        AVAILABLE, REDEEMED, REQUESTED, REJECTED
    }

    // Minimal builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private LoyaltyCard loyaltyCard;
        private String description;
        private RewardStatus status;

        public Builder loyaltyCard(LoyaltyCard loyaltyCard) { this.loyaltyCard = loyaltyCard; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder status(RewardStatus status) { this.status = status; return this; }
        public Reward build() { return new Reward(null, loyaltyCard, description, status, null, null); }
    }



}
