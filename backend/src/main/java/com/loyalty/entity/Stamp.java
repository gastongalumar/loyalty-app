package com.loyalty.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "stamps")
public class Stamp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loyalty_card_id", nullable = false)
    private LoyaltyCard loyaltyCard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by_id", nullable = false)
    private User addedBy;

    private String note;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Stamp() {}

    public Stamp(Long id, LoyaltyCard loyaltyCard, User addedBy, String note, LocalDateTime createdAt) {
        this.id = id;
        this.loyaltyCard = loyaltyCard;
        this.addedBy = addedBy;
        this.note = note;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LoyaltyCard getLoyaltyCard() { return loyaltyCard; }
    public void setLoyaltyCard(LoyaltyCard loyaltyCard) { this.loyaltyCard = loyaltyCard; }

    public User getAddedBy() { return addedBy; }
    public void setAddedBy(User addedBy) { this.addedBy = addedBy; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private LoyaltyCard loyaltyCard;
        private User addedBy;
        private String note;

        public Builder loyaltyCard(LoyaltyCard loyaltyCard) { this.loyaltyCard = loyaltyCard; return this; }
        public Builder addedBy(User addedBy) { this.addedBy = addedBy; return this; }
        public Builder note(String note) { this.note = note; return this; }
        public Stamp build() { return new Stamp(null, loyaltyCard, addedBy, note, null); }
    }
}
