package com.loyalty.dto.platform;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateBusinessRequest {

    @NotBlank
    @Size(min = 2, max = 200)
    private String name;

    @NotBlank
    @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$",
            message = "slug must be lowercase alphanumeric with single hyphens")
    @Size(min = 3, max = 80)
    private String slug;

    private String description;

    @Min(1)
    @Max(100)
    private Integer stampsRequired;

    @Size(max = 500)
    private String rewardDescription;

    @Size(max = 16)
    private String stampIcon;

    @Size(max = 16)
    private String rewardIcon;
}
