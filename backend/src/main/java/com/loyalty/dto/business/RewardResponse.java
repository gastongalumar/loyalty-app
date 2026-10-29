package com.loyalty.dto.business;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RewardResponse {
    private Long id;
    private Long cardId;
    private String customerName;
    private String description;
    private String status;
    private LocalDateTime earnedAt;
    private LocalDateTime redeemedAt;
    private String redeemedBy;
}
