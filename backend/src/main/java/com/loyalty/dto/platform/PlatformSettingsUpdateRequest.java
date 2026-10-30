package com.loyalty.dto.platform;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PlatformSettingsUpdateRequest {

    @Size(min = 2, max = 120)
    private String appName;

    @Size(max = 200)
    private String tagline;

    @Size(max = 500)
    private String logoUrl;

    @Size(max = 500)
    private String backgroundUrl;

    @Min(0)
    @Max(100)
    private Integer backgroundVisibility;

    @Min(0)
    @Max(24)
    private Integer backgroundBlur;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "colorPrimary must be a hex color like #FF6B35")
    private String colorPrimary;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "colorSecondary must be a hex color like #1A1A2E")
    private String colorSecondary;
}
