package com.loyalty.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class QrCodeServiceTest {

    private QrCodeService qrCodeService;

    @BeforeEach
    void setUp() {
        qrCodeService = new QrCodeService();
    }

    @Test
    void shouldGenerateUniqueQrCodeIds() {
        String id1 = qrCodeService.generateQrCodeId();
        String id2 = qrCodeService.generateQrCodeId();
        assertThat(id1).isNotEqualTo(id2);
    }

    @Test
    void shouldGenerateQrCodeIdWithCorrectLength() {
        String id = qrCodeService.generateQrCodeId();
        assertThat(id).hasSize(16);
        assertThat(id).matches("[A-Z0-9]+");
    }

    @Test
    void shouldGenerateBase64QrCodeImage() {
        String base64 = qrCodeService.generateQrCodeBase64("TEST123");
        assertThat(base64).startsWith("data:image/png;base64,");
        assertThat(base64.length()).isGreaterThan(100);
    }
}
