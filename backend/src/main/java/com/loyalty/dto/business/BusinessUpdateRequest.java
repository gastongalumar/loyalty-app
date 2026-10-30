package com.loyalty.dto.business;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BusinessUpdateRequest {

    @Size(max = 200)
    private String name;

    @Size(max = 1000)
    private String description;

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

    @Size(max = 16)
    private String stampIcon;

    @Size(max = 16)
    private String rewardIcon;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "colorPrimary must be a hex color like #FF6B35")
    private String colorPrimary;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "colorSecondary must be a hex color like #1A1A2E")
    private String colorSecondary;

    @Min(1)
    @Max(100)
    private Integer stampsRequired;

    @Size(max = 500)
    private String rewardDescription;
}
