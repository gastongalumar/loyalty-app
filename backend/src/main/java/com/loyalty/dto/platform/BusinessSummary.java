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
public class BusinessSummary {
    private Long id;
    private String slug;
    private String name;
    private String status;
    private Integer totalCustomers;
    private LocalDateTime createdAt;
}
