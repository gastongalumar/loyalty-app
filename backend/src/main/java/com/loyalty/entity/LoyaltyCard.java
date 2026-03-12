package com.loyalty.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "loyalty_cards")
public class LoyaltyCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false)
    private Integer totalStamps;

    @Column(nullable = false)
    private Integer currentStamps;

    @Column(nullable = false)
    private Integer completedCards;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CardStatus status;

    @OneToMany(mappedBy = "loyaltyCard", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Stamp> stamps = new ArrayList<>();

    @OneToMany(mappedBy = "loyaltyCard", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Reward> rewards = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public LoyaltyCard() {}

    public LoyaltyCard(Long id, User user, Business business, Integer totalStamps, Integer currentStamps, Integer completedCards, CardStatus status, List<Stamp> stamps, List<Reward> rewards, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.user = user;
        this.business = business;
        this.totalStamps = totalStamps;
        this.currentStamps = currentStamps;
        this.completedCards = completedCards;
        this.status = status;
        this.stamps = stamps != null ? stamps : new ArrayList<>();
        this.rewards = rewards != null ? rewards : new ArrayList<>();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Business getBusiness() { return business; }
    public void setBusiness(Business business) { this.business = business; }

    public Integer getTotalStamps() { return totalStamps; }
    public void setTotalStamps(Integer totalStamps) { this.totalStamps = totalStamps; }

    public Integer getCurrentStamps() { return currentStamps; }
    public void setCurrentStamps(Integer currentStamps) { this.currentStamps = currentStamps; }

    public Integer getCompletedCards() { return completedCards; }
    public void setCompletedCards(Integer completedCards) { this.completedCards = completedCards; }

    public CardStatus getStatus() { return status; }
    public void setStatus(CardStatus status) { this.status = status; }

    public List<Stamp> getStamps() { return stamps; }
    public void setStamps(List<Stamp> stamps) { this.stamps = stamps; }

    public List<Reward> getRewards() { return rewards; }
    public void setRewards(List<Reward> rewards) { this.rewards = rewards; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum CardStatus {
        ACTIVE, COMPLETED, REWARD_PENDING
    }

    // Minimal builder - only used in a few places
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id;
        private User user;
        private Business business;
        private Integer totalStamps;
        private Integer currentStamps;
        private Integer completedCards;
        private CardStatus status;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder business(Business business) { this.business = business; return this; }
        public Builder totalStamps(Integer totalStamps) { this.totalStamps = totalStamps; return this; }
        public Builder currentStamps(Integer currentStamps) { this.currentStamps = currentStamps; return this; }
        public Builder completedCards(Integer completedCards) { this.completedCards = completedCards; return this; }
        public Builder status(CardStatus status) { this.status = status; return this; }
        public LoyaltyCard build() {
            return new LoyaltyCard(id, user, business, totalStamps, currentStamps, completedCards, status, new ArrayList<>(), new ArrayList<>(), null, null);
        }
    }
}
