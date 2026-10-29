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
public class StampResponse {
    private Long id;
    private String addedByName;
    private String note;
    private LocalDateTime createdAt;
}
