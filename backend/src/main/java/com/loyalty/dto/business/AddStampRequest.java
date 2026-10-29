package com.loyalty.dto.business;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AddStampRequest {

    @NotNull
    private Long userId;

    @Size(max = 300)
    private String note;
}
