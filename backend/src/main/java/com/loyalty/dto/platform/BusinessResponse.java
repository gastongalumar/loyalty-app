package com.loyalty.dto.platform;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessResponse {
    private Long id;
    private String slug;
    private String name;
    private String description;
    private String logoUrl;
    private String backgroundUrl;
    private String colorPrimary;
    private String colorSecondary;
    private String stampIcon;
    private String rewardIcon;
    private Integer stampsRequired;
    private String rewardDescription;
    private String status;
    private Long ownerId;
    private Integer totalCustomers;
    private Integer totalAdmins;
    private LocalDateTime createdAt;
}
