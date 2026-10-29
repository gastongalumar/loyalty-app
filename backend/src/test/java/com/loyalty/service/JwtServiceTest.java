package com.loyalty.service;

import com.loyalty.entity.Business;
import com.loyalty.entity.User;
import com.loyalty.security.JwtService;
import com.loyalty.security.SecurityUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;
    private User tenantUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey",
                "test-only-secret-key-0123456789abcdef0123456789abcdef");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);

        Business business = Business.builder()
                .id(7L).slug("cafe-a").name("Cafe A")
                .stampsRequired(10).rewardDescription("Free coffee")
                .build();

        tenantUser = User.builder()
                .id(1L).email("test@example.com").password("encoded")
                .firstName("John").lastName("Doe")
                .role(User.Role.CUSTOMER).qrCode("ABC123")
                .tenant(business).tenantId(7L)
                .build();
    }

    @Test
    void shouldIncludeTenantClaims() {
        String token = jwtService.generateToken(tenantUser);

        assertThat(jwtService.extractUsername(token)).isEqualTo("test@example.com");
        assertThat(jwtService.extractUserId(token)).isEqualTo(1L);
        assertThat(jwtService.extractTenantId(token)).isEqualTo(7L);
        assertThat(jwtService.extractTenantSlug(token)).isEqualTo("cafe-a");
        assertThat(jwtService.extractRole(token)).isEqualTo("CUSTOMER");
    }

    @Test
    void shouldOmitTenantClaimsForPlatformAdmin() {
        User platform = User.builder()
                .id(9L).email("platform@example.com").password("encoded")
                .firstName("Platform").lastName("Admin")
                .role(User.Role.PLATFORM_ADMIN).qrCode("PLATFORMQR")
                .build();

        String token = jwtService.generateToken(platform);

        assertThat(jwtService.extractTenantId(token)).isNull();
        assertThat(jwtService.extractRole(token)).isEqualTo("PLATFORM_ADMIN");
    }

    @Test
    void shouldValidateToken() {
        String token = jwtService.generateToken(tenantUser);
        SecurityUser principal = new SecurityUser(1L, "test@example.com", "encoded",
                User.Role.CUSTOMER, 7L, "cafe-a");

        assertThat(jwtService.isTokenValid(token, principal)).isTrue();
    }

    @Test
    void shouldRejectTokenForDifferentUser() {
        String token = jwtService.generateToken(tenantUser);
        SecurityUser other = new SecurityUser(2L, "other@example.com", "encoded",
                User.Role.CUSTOMER, 7L, "cafe-a");

        assertThat(jwtService.isTokenValid(token, other)).isFalse();
    }
}

