package com.loyalty.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "fidelity_tiers")
public class FidelityTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false)
    private Integer cardsRequired;  // Ej: 5 tarjetas completadas

    @Column(nullable = false)
    private String rewardDescription;  // Ej: "Café gratis"

    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // 👇 NUEVO: Relación con FidelityReward para permitir borrado en cascada
    @JsonIgnore
    @OneToMany(mappedBy = "tier", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FidelityReward> fidelityRewards = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Business getBusiness() { return business; }
    public void setBusiness(Business business) { this.business = business; }

    public Integer getCardsRequired() { return cardsRequired; }
    public void setCardsRequired(Integer cardsRequired) { this.cardsRequired = cardsRequired; }

    public String getRewardDescription() { return rewardDescription; }
    public void setRewardDescription(String rewardDescription) { this.rewardDescription = rewardDescription; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // 👇 NUEVOS getters y setters para fidelityRewards
    public List<FidelityReward> getFidelityRewards() { return fidelityRewards; }
    public void setFidelityRewards(List<FidelityReward> fidelityRewards) {
        this.fidelityRewards = fidelityRewards;
    }

    // Método helper para agregar recompensas (opcional pero útil)
    public void addFidelityReward(FidelityReward reward) {
        fidelityRewards.add(reward);
        reward.setTier(this);
    }

    // Método helper para remover recompensas (opcional pero útil)
    public void removeFidelityReward(FidelityReward reward) {
        fidelityRewards.remove(reward);
        reward.setTier(null);
    }
}
