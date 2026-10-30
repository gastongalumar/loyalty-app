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
public class PlatformSettingsResponse {
    private String appName;
    private String tagline;
    private String logoUrl;
    private String backgroundUrl;
    private Integer backgroundVisibility;
    private Integer backgroundBlur;
    private String colorPrimary;
    private String colorSecondary;
    private LocalDateTime updatedAt;
}
