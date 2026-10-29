package com.loyalty.dto.business;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BusinessUpdateRequest {

    @Size(max = 200)
    private String name;

    private String description;

    @Size(max = 500)
    private String logoUrl;

    @Min(1)
    @Max(100)
    private Integer stampsRequired;

    @Size(max = 500)
    private String rewardDescription;
}
