package com.loyalty.dto.publicapi;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantPublicResponse {
    private String slug;
    private String name;
    private String status;
    private String colorPrimary;
    private String colorSecondary;
    private String logoUrl;
}
