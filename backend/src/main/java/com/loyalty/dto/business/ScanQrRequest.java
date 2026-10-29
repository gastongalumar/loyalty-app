package com.loyalty.dto.business;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ScanQrRequest {

    @NotBlank
    @Size(max = 64)
    private String qrCode;

    @Size(max = 300)
    private String note;
}
