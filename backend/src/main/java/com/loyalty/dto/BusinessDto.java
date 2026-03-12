package com.loyalty.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessDto {
    private Long id;
    private String name;
    private String description;
    private String logoUrl;
    private Integer stampsRequired;
    private String rewardDescription;
    private Long ownerId;
    private String ownerName;
    private Integer totalCustomers;
    private LocalDateTime createdAt;
}
