package com.loyalty.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "loyalty_cards")
public class LoyaltyCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
   // @JsonManagedReference
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

    // ✅ BUG FIX #1: Missing @OneToMany mapping for FidelityReward.
    // FidelityReward.loyaltyCard existed but the inverse side was never declared
    // here, so getLoyaltyCard().getFidelityRewards() always returned null/empty.
    @OneToMany(mappedBy = "loyaltyCard", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FidelityReward> fidelityRewards = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public LoyaltyCard() {}

    // --- Getters & Setters ---

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
    public void setStamps(List<Stamp> stamps) { this.stamps = stamps != null ? stamps : new ArrayList<>(); }

    public List<Reward> getRewards() { return rewards; }
    public void setRewards(List<Reward> rewards) { this.rewards = rewards != null ? rewards : new ArrayList<>(); }

    // ✅ BUG FIX #1 (continued): Getter/setter for new fidelityRewards field
    public List<FidelityReward> getFidelityRewards() { return fidelityRewards; }
    public void setFidelityRewards(List<FidelityReward> fidelityRewards) {
        this.fidelityRewards = fidelityRewards != null ? fidelityRewards : new ArrayList<>();
    }

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
        ACTIVE, REWARD_PENDING, INACTIVE
    }

    // Builder (condensed, includes fidelityRewards)
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final LoyaltyCard card = new LoyaltyCard();
        public Builder id(Long id)                              { card.id = id; return this; }
        public Builder user(User u)                             { card.user = u; return this; }
        public Builder business(Business b)                     { card.business = b; return this; }
        public Builder totalStamps(Integer t)                   { card.totalStamps = t; return this; }
        public Builder currentStamps(Integer c)                 { card.currentStamps = c; return this; }
        public Builder completedCards(Integer c)                { card.completedCards = c; return this; }
        public Builder status(CardStatus s)                     { card.status = s; return this; }
        public Builder stamps(List<Stamp> s)                    { card.stamps = s != null ? s : new ArrayList<>(); return this; }
        public Builder rewards(List<Reward> r)                  { card.rewards = r != null ? r : new ArrayList<>(); return this; }
        public Builder fidelityRewards(List<FidelityReward> fr) { card.fidelityRewards = fr != null ? fr : new ArrayList<>(); return this; }
        public LoyaltyCard build()                              { return card; }
    }
}
