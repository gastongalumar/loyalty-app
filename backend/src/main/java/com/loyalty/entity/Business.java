package com.loyalty.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "businesses")
public class Business {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    private String logoUrl;

    @Column(nullable = false)
    private Integer stampsRequired;

    @Column(nullable = false)
    private String rewardDescription;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @JsonIgnore
    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LoyaltyCard> loyaltyCards = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Business() {}

    public Business(Long id, String name, String description, String logoUrl, Integer stampsRequired, String rewardDescription, User owner, List<LoyaltyCard> loyaltyCards, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.logoUrl = logoUrl;
        this.stampsRequired = stampsRequired;
        this.rewardDescription = rewardDescription;
        this.owner = owner;
        this.loyaltyCards = loyaltyCards != null ? loyaltyCards : new ArrayList<>();
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public Integer getStampsRequired() { return stampsRequired; }
    public void setStampsRequired(Integer stampsRequired) { this.stampsRequired = stampsRequired; }

    public String getRewardDescription() { return rewardDescription; }
    public void setRewardDescription(String rewardDescription) { this.rewardDescription = rewardDescription; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public List<LoyaltyCard> getLoyaltyCards() { return loyaltyCards; }
    public void setLoyaltyCards(List<LoyaltyCard> loyaltyCards) { this.loyaltyCards = loyaltyCards; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id;
        private String name;
        private String description;
        private Integer stampsRequired;
        private String rewardDescription;
        private User owner;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder stampsRequired(Integer stampsRequired) { this.stampsRequired = stampsRequired; return this; }
        public Builder rewardDescription(String rewardDescription) { this.rewardDescription = rewardDescription; return this; }
        public Builder owner(User owner) { this.owner = owner; return this; }
        public Business build() { return new Business(id, name, description, null, stampsRequired, rewardDescription, owner, null, null); }
    }
}
