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
public class CustomerResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String qrCode;
    private Integer currentStamps;
    private Integer totalStamps;
    private Integer completedCards;
    private String cardStatus;
    private LocalDateTime memberSince;
}
