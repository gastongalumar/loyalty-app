package com.loyalty.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO returned by GET /api/customer/card and GET /api/admin/customers/{id}/card
 *
 * ✅ BUG FIX #3: Added:
 *   - FidelityRewardDto inner class (was missing serializable form)
 *   - fidelityRewards list field (was declared but inner DTO was incomplete)
 *   - bonusProgressPercent, nextBonusDescription, nextBonusCardsRequired
 *     (new fields powering the frontend progress bar — no extra API call needed)
 */
public class LoyaltyCardDto {

    private Long id;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private String qrCode;
    private String businessName;
    private String rewardDescription;
    private Integer currentStamps;
    private Integer totalStamps;
    private Integer completedCards;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<StampDto> recentStamps;
    private List<RewardDto> rewards;
    private List<FidelityRewardDto> fidelityRewards;

    // ✅ NEW — bonus milestone progress fields
    private Integer bonusProgressPercent;   // 0-100 towards next fidelity tier
    private String  nextBonusDescription;   // e.g. "Free coffee"
    private Integer nextBonusCardsRequired; // how many completed cards needed

    public LoyaltyCardDto() {}

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getRewardDescription() { return rewardDescription; }
    public void setRewardDescription(String rewardDescription) { this.rewardDescription = rewardDescription; }

    public Integer getCurrentStamps() { return currentStamps; }
    public void setCurrentStamps(Integer currentStamps) { this.currentStamps = currentStamps; }

    public Integer getTotalStamps() { return totalStamps; }
    public void setTotalStamps(Integer totalStamps) { this.totalStamps = totalStamps; }

    public Integer getCompletedCards() { return completedCards; }
    public void setCompletedCards(Integer completedCards) { this.completedCards = completedCards; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<StampDto> getRecentStamps() { return recentStamps; }
    public void setRecentStamps(List<StampDto> recentStamps) { this.recentStamps = recentStamps; }

    public List<RewardDto> getRewards() { return rewards; }
    public void setRewards(List<RewardDto> rewards) { this.rewards = rewards; }

    public List<FidelityRewardDto> getFidelityRewards() { return fidelityRewards; }
    public void setFidelityRewards(List<FidelityRewardDto> fidelityRewards) { this.fidelityRewards = fidelityRewards; }

    public Integer getBonusProgressPercent() { return bonusProgressPercent; }
    public void setBonusProgressPercent(Integer bonusProgressPercent) { this.bonusProgressPercent = bonusProgressPercent; }

    public String getNextBonusDescription() { return nextBonusDescription; }
    public void setNextBonusDescription(String nextBonusDescription) { this.nextBonusDescription = nextBonusDescription; }

    public Integer getNextBonusCardsRequired() { return nextBonusCardsRequired; }
    public void setNextBonusCardsRequired(Integer nextBonusCardsRequired) { this.nextBonusCardsRequired = nextBonusCardsRequired; }

    // ── Inner DTOs ─────────────────────────────────────────────────────────────

    public static class StampDto {
        private Long id;
        private String note;
        private String addedBy;
        private LocalDateTime createdAt;

        public StampDto() {}
        public StampDto(Long id, String note, String addedBy, LocalDateTime createdAt) {
            this.id = id; this.note = note; this.addedBy = addedBy; this.createdAt = createdAt;
        }
        public Long getId() { return id; } public void setId(Long id) { this.id = id; }
        public String getNote() { return note; } public void setNote(String note) { this.note = note; }
        public String getAddedBy() { return addedBy; } public void setAddedBy(String addedBy) { this.addedBy = addedBy; }
        public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class RewardDto {
        private Long id;
        private String description;
        private String status;
        private LocalDateTime earnedAt;
        private LocalDateTime redeemedAt;

        public RewardDto() {}
        public RewardDto(Long id, String description, String status, LocalDateTime earnedAt, LocalDateTime redeemedAt) {
            this.id = id; this.description = description; this.status = status;
            this.earnedAt = earnedAt; this.redeemedAt = redeemedAt;
        }
        public Long getId() { return id; } public void setId(Long id) { this.id = id; }
        public String getDescription() { return description; } public void setDescription(String d) { this.description = d; }
        public String getStatus() { return status; } public void setStatus(String s) { this.status = s; }
        public LocalDateTime getEarnedAt() { return earnedAt; } public void setEarnedAt(LocalDateTime e) { this.earnedAt = e; }
        public LocalDateTime getRedeemedAt() { return redeemedAt; } public void setRedeemedAt(LocalDateTime r) { this.redeemedAt = r; }
    }

    /**
     * ✅ BUG FIX #3: FidelityRewardDto — was missing from the codebase entirely.
     * Jackson was silently serializing null because no proper DTO existed.
     * cardsRequired is denormalized from the tier for convenience.
     */
    public static class FidelityRewardDto {
        private Long id;
        private String description;
        private String status;          // AVAILABLE | REQUESTED | REDEEMED
        private Integer cardsRequired;  // denormalized from FidelityTier
        private LocalDateTime earnedAt;
        private LocalDateTime redeemedAt;

        public FidelityRewardDto() {}
        public FidelityRewardDto(Long id, String description, String status,
                                 Integer cardsRequired,
                                 LocalDateTime earnedAt, LocalDateTime redeemedAt) {
            this.id = id;
            this.description = description;
            this.status = status;
            this.cardsRequired = cardsRequired;
            this.earnedAt = earnedAt;
            this.redeemedAt = redeemedAt;
        }
        public Long getId() { return id; } public void setId(Long id) { this.id = id; }
        public String getDescription() { return description; } public void setDescription(String d) { this.description = d; }
        public String getStatus() { return status; } public void setStatus(String s) { this.status = s; }
        public Integer getCardsRequired() { return cardsRequired; } public void setCardsRequired(Integer c) { this.cardsRequired = c; }
        public LocalDateTime getEarnedAt() { return earnedAt; } public void setEarnedAt(LocalDateTime e) { this.earnedAt = e; }
        public LocalDateTime getRedeemedAt() { return redeemedAt; } public void setRedeemedAt(LocalDateTime r) { this.redeemedAt = r; }
    }

    // ── Admin request DTOs ─────────────────────────────────────────────────────

    public static class AddStampRequest {
        private Long userId;
        private String note;
        public Long getUserId() { return userId; } public void setUserId(Long userId) { this.userId = userId; }
        public String getNote() { return note; } public void setNote(String note) { this.note = note; }
    }

    public static class ScanQrRequest {
        private String qrCode;
        private String note;
        public String getQrCode() { return qrCode; } public void setQrCode(String qrCode) { this.qrCode = qrCode; }
        public String getNote() { return note; } public void setNote(String note) { this.note = note; }
    }
}
