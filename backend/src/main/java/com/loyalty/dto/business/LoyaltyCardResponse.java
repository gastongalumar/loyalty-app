package com.loyalty.dto.business;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyCardResponse {
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
    private List<StampResponse> recentStamps;
    private List<RewardResponse> rewards;
}
