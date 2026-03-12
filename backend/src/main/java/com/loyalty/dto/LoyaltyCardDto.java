package com.loyalty.dto;

import java.time.LocalDateTime;
import java.util.List;

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

    public LoyaltyCardDto() {}

    public LoyaltyCardDto(Long id, Long userId, String customerName, String customerEmail, String qrCode, String businessName, String rewardDescription, Integer currentStamps, Integer totalStamps, Integer completedCards, String status, LocalDateTime createdAt, LocalDateTime updatedAt, List<StampDto> recentStamps, List<RewardDto> rewards) {
        this.id = id;
        this.userId = userId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.qrCode = qrCode;
        this.businessName = businessName;
        this.rewardDescription = rewardDescription;
        this.currentStamps = currentStamps;
        this.totalStamps = totalStamps;
        this.completedCards = completedCards;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.recentStamps = recentStamps;
        this.rewards = rewards;
    }

    // getters/setters
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

    // Minimal builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private LoyaltyCardDto dto = new LoyaltyCardDto();
        public Builder id(Long id) { dto.setId(id); return this; }
        public Builder userId(Long userId) { dto.setUserId(userId); return this; }
        public Builder customerName(String customerName) { dto.setCustomerName(customerName); return this; }
        public Builder customerEmail(String customerEmail) { dto.setCustomerEmail(customerEmail); return this; }
        public Builder qrCode(String qrCode) { dto.setQrCode(qrCode); return this; }
        public Builder businessName(String businessName) { dto.setBusinessName(businessName); return this; }
        public Builder rewardDescription(String rewardDescription) { dto.setRewardDescription(rewardDescription); return this; }
        public Builder currentStamps(Integer currentStamps) { dto.setCurrentStamps(currentStamps); return this; }
        public Builder totalStamps(Integer totalStamps) { dto.setTotalStamps(totalStamps); return this; }
        public Builder completedCards(Integer completedCards) { dto.setCompletedCards(completedCards); return this; }
        public Builder status(String status) { dto.setStatus(status); return this; }
        public Builder createdAt(java.time.LocalDateTime createdAt) { dto.setCreatedAt(createdAt); return this; }
        public Builder updatedAt(java.time.LocalDateTime updatedAt) { dto.setUpdatedAt(updatedAt); return this; }
        public Builder recentStamps(java.util.List<StampDto> recentStamps) { dto.setRecentStamps(recentStamps); return this; }
        public Builder rewards(java.util.List<RewardDto> rewards) { dto.setRewards(rewards); return this; }
        public LoyaltyCardDto build() { return dto; }
    }

    public static class StampDto {
        private Long id;
        private String addedByName;
        private String note;
        private LocalDateTime createdAt;

        public StampDto() {}
        public StampDto(Long id, String addedByName, String note, LocalDateTime createdAt) { this.id = id; this.addedByName = addedByName; this.note = note; this.createdAt = createdAt; }
        public Long getId() { return id; } public void setId(Long id) { this.id = id; }
        public String getAddedByName() { return addedByName; } public void setAddedByName(String addedByName) { this.addedByName = addedByName; }
        public String getNote() { return note; } public void setNote(String note) { this.note = note; }
        public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public static StampDto.Builder builder() { return new StampDto.Builder(); }
        public static class Builder { private StampDto dto = new StampDto(); public Builder id(Long id){dto.setId(id);return this;} public Builder addedByName(String name){dto.setAddedByName(name);return this;} public Builder note(String note){dto.setNote(note);return this;} public Builder createdAt(LocalDateTime c){dto.setCreatedAt(c);return this;} public StampDto build(){return dto;} }
    }

    public static class RewardDto {
        private Long id;
        private String description;
        private String status;
        private LocalDateTime earnedAt;
        private LocalDateTime redeemedAt;

        public RewardDto() {}
        public RewardDto(Long id, String description, String status, LocalDateTime earnedAt, LocalDateTime redeemedAt) { this.id = id; this.description = description; this.status = status; this.earnedAt = earnedAt; this.redeemedAt = redeemedAt; }
        public Long getId(){return id;} public void setId(Long id){this.id=id;}
        public String getDescription(){return description;} public void setDescription(String description){this.description=description;}
        public String getStatus(){return status;} public void setStatus(String status){this.status=status;}
        public LocalDateTime getEarnedAt(){return earnedAt;} public void setEarnedAt(LocalDateTime earnedAt){this.earnedAt=earnedAt;}
        public LocalDateTime getRedeemedAt(){return redeemedAt;} public void setRedeemedAt(LocalDateTime redeemedAt){this.redeemedAt=redeemedAt;}
        public static RewardDto.Builder builder(){return new RewardDto.Builder();}
        public static class Builder{ private RewardDto dto = new RewardDto(); public Builder id(Long id){dto.setId(id);return this;} public Builder description(String d){dto.setDescription(d);return this;} public Builder status(String s){dto.setStatus(s);return this;} public Builder earnedAt(LocalDateTime e){dto.setEarnedAt(e);return this;} public Builder redeemedAt(LocalDateTime r){dto.setRedeemedAt(r);return this;} public RewardDto build(){return dto;} }
    }

    public static class AddStampRequest {
        private Long userId;
        private String note;
        public AddStampRequest(){}
        public AddStampRequest(Long userId, String note){this.userId=userId;this.note=note;}
        public Long getUserId(){return userId;} public void setUserId(Long userId){this.userId=userId;} public String getNote(){return note;} public void setNote(String note){this.note=note;}
    }

    public static class ScanQrRequest {
        private String qrCode;
        private String note;
        public ScanQrRequest(){}
        public ScanQrRequest(String qrCode, String note){this.qrCode=qrCode;this.note=note;}
        public String getQrCode(){return qrCode;} public void setQrCode(String qrCode){this.qrCode=qrCode;} public String getNote(){return note;} public void setNote(String note){this.note=note;}
    }
}
