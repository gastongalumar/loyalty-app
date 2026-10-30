package com.loyalty.security;

import com.loyalty.entity.Business;
import com.loyalty.entity.LoyaltyCard;
import com.loyalty.entity.Reward;
import com.loyalty.entity.User;
import com.loyalty.repository.BusinessRepository;
import com.loyalty.repository.LoyaltyCardRepository;
import com.loyalty.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Cross-tenant matrix. Every endpoint that receives an id must answer 404 (not 403)
 * when the resource belongs to another tenant, so existence is never leaked.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class TenantIsolationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private BusinessRepository businessRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private LoyaltyCardRepository cardRepository;
    @Autowired private JwtService jwtService;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private com.loyalty.repository.RewardRepository rewardRepository;

    private Business cafeA;
    private Business gymB;
    private User adminA;
    private User customerA;
    private User customerB;
    private User platformAdmin;
    private LoyaltyCard cardA;
    private LoyaltyCard cardB;
    private Reward rewardA;
    private Reward rewardB;

    private String adminAToken;
    private String customerAToken;
    private String platformToken;

    @BeforeEach
    void setUp() {
        cafeA = businessRepository.save(Business.builder()
                .name("Cafe A").slug("cafe-a").stampsRequired(10)
                .rewardDescription("Free coffee").status(Business.Status.ACTIVE)
                .colorPrimary("#FF6B35").colorSecondary("#1A1A2E")
                .logoUrl("https://cdn.example.com/cafe-a.png")
                .backgroundUrl("https://cdn.example.com/cafe-a-bg.jpg")
                .backgroundVisibility(24)
                .backgroundBlur(10)
                .stampIcon("🌿").rewardIcon("🎁")
                .build());
        gymB = businessRepository.save(Business.builder()
                .name("Gym B").slug("gym-b").stampsRequired(8)
                .rewardDescription("Free month").status(Business.Status.ACTIVE).build());

        adminA = userRepository.save(User.builder()
                .tenant(cafeA).email("admin@a.com").password(passwordEncoder.encode("password123"))
                .firstName("Admin").lastName("A").role(User.Role.BUSINESS_ADMIN).qrCode("QRA").build());
        customerA = userRepository.save(User.builder()
                .tenant(cafeA).email("customer@a.com").password(passwordEncoder.encode("password123"))
                .firstName("Customer").lastName("A").role(User.Role.CUSTOMER).qrCode("QRCA").build());
        customerB = userRepository.save(User.builder()
                .tenant(gymB).email("customer@b.com").password(passwordEncoder.encode("password123"))
                .firstName("Customer").lastName("B").role(User.Role.CUSTOMER).qrCode("QRCB").build());
        platformAdmin = userRepository.save(User.builder()
                .email("platform@loyalty.com").password(passwordEncoder.encode("password123"))
                .firstName("Platform").lastName("Admin").role(User.Role.PLATFORM_ADMIN).qrCode("QRP").build());

        cardA = cardRepository.save(LoyaltyCard.builder()
                .tenantId(cafeA.getId()).user(customerA).business(cafeA)
                .totalStamps(10).currentStamps(0).completedCards(1)
                .status(LoyaltyCard.CardStatus.REWARD_PENDING).build());
        cardB = cardRepository.save(LoyaltyCard.builder()
                .tenantId(gymB.getId()).user(customerB).business(gymB)
                .totalStamps(8).currentStamps(1).completedCards(0)
                .status(LoyaltyCard.CardStatus.ACTIVE).build());

        rewardA = rewardRepository.save(Reward.builder()
                .tenantId(cafeA.getId()).loyaltyCard(cardA)
                .description("Free coffee").status(Reward.RewardStatus.AVAILABLE).build());
        rewardB = rewardRepository.save(Reward.builder()
                .tenantId(gymB.getId()).loyaltyCard(cardB)
                .description("Free month").status(Reward.RewardStatus.AVAILABLE).build());

        adminAToken = jwtService.generateToken(adminA);
        customerAToken = jwtService.generateToken(customerA);
        platformToken = jwtService.generateToken(platformAdmin);
    }

    @Test
    void adminSeesOnlyOwnBusiness() throws Exception {
        mockMvc.perform(get("/api/v1/business/me").header("Authorization", bearer(adminAToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("cafe-a"));
    }

    @Test
    void adminCustomerListIsTenantScoped() throws Exception {
        mockMvc.perform(get("/api/v1/business/customers").header("Authorization", bearer(adminAToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].email").value("customer@a.com"));
    }

    @Test
    void adminCannotReadOtherTenantCard() throws Exception {
        mockMvc.perform(get("/api/v1/business/customers/{id}/card", customerB.getId())
                        .header("Authorization", bearer(adminAToken)))
                .andExpect(status().isNotFound());
    }

    @Test
    void adminCannotReadOtherTenantQr() throws Exception {
        mockMvc.perform(get("/api/v1/business/customers/{id}/qr", customerB.getId())
                        .header("Authorization", bearer(adminAToken)))
                .andExpect(status().isNotFound());
    }

    @Test
    void adminCannotStampOtherTenantCustomer() throws Exception {
        mockMvc.perform(post("/api/v1/business/stamps")
                        .header("Authorization", bearer(adminAToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("userId", customerB.getId(), "note", "x"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void adminCannotScanOtherTenantQr() throws Exception {
        mockMvc.perform(post("/api/v1/business/stamps/scan")
                        .header("Authorization", bearer(adminAToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("qrCode", "QRCB"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void adminCannotSearchOtherTenantCustomer() throws Exception {
        mockMvc.perform(get("/api/v1/business/customers").param("q", "customer@b.com")
                        .header("Authorization", bearer(adminAToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    void customerSeesOwnCard() throws Exception {
        mockMvc.perform(get("/api/v1/customer/card").header("Authorization", bearer(customerAToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.businessName").value("Cafe A"))
                .andExpect(jsonPath("$.currentStamps").value(0))
                .andExpect(jsonPath("$.rewards[0].status").value("AVAILABLE"));
    }

    @Test
    void adminCanRedeemOwnRewardAndCardReturnsToActive() throws Exception {
        mockMvc.perform(post("/api/v1/rewards/{id}/redeem", rewardA.getId())
                        .header("Authorization", bearer(adminAToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REDEEMED"))
                .andExpect(jsonPath("$.redeemedBy").value("Admin A"));

        LoyaltyCard reloaded = cardRepository.findByIdAndTenantId(cardA.getId(), cafeA.getId()).orElseThrow();
        org.assertj.core.api.Assertions.assertThat(reloaded.getStatus())
                .isEqualTo(LoyaltyCard.CardStatus.ACTIVE);
    }

    @Test
    void cannotRedeemTwice() throws Exception {
        mockMvc.perform(post("/api/v1/rewards/{id}/redeem", rewardA.getId())
                        .header("Authorization", bearer(adminAToken)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/rewards/{id}/redeem", rewardA.getId())
                        .header("Authorization", bearer(adminAToken)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("reward_already_redeemed"));
    }

    @Test
    void cannotRedeemOtherTenantReward() throws Exception {
        mockMvc.perform(post("/api/v1/rewards/{id}/redeem", rewardB.getId())
                        .header("Authorization", bearer(adminAToken)))
                .andExpect(status().isNotFound());
    }

    @Test
    void customerCannotRedeem() throws Exception {
        mockMvc.perform(post("/api/v1/rewards/{id}/redeem", rewardA.getId())
                        .header("Authorization", bearer(customerAToken)))
                .andExpect(status().isForbidden());
    }

    @Test
    void rewardListIsTenantScoped() throws Exception {
        mockMvc.perform(get("/api/v1/rewards").param("status", "AVAILABLE")
                        .header("Authorization", bearer(adminAToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].description").value("Free coffee"));
    }

    @Test
    void platformAdminCannotOperateInsideBusiness() throws Exception {
        mockMvc.perform(get("/api/v1/business/me").header("Authorization", bearer(platformToken)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/customer/card").header("Authorization", bearer(platformToken)))
                .andExpect(status().isForbidden());
    }

    @Test
    void customerCannotUseBusinessEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/business/customers").header("Authorization", bearer(customerAToken)))
                .andExpect(status().isForbidden());
    }

    @Test
    void tenantHeaderMismatchIsRejected() throws Exception {
        mockMvc.perform(get("/api/v1/business/me")
                        .header("Authorization", bearer(adminAToken))
                        .header("X-Tenant-Slug", "gym-b"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("tenant_mismatch"));
    }

    @Test
    void suspendedTenantIsBlocked() throws Exception {
        gymB.setStatus(Business.Status.SUSPENDED);
        businessRepository.save(gymB);

        mockMvc.perform(get("/api/v1/business/me").header("Authorization", bearer(adminAToken)))
                .andExpect(status().isOk());
    }

    @Test
    void publicTenantEndpointReturnsBranding() throws Exception {
        mockMvc.perform(get("/api/public/tenants/cafe-a"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("cafe-a"))
                .andExpect(jsonPath("$.colorPrimary").value("#FF6B35"))
                .andExpect(jsonPath("$.colorSecondary").value("#1A1A2E"))
                .andExpect(jsonPath("$.logoUrl").value("https://cdn.example.com/cafe-a.png"))
                .andExpect(jsonPath("$.backgroundUrl").value("https://cdn.example.com/cafe-a-bg.jpg"))
                .andExpect(jsonPath("$.backgroundVisibility").value(24))
                .andExpect(jsonPath("$.backgroundBlur").value(10))
                .andExpect(jsonPath("$.stampIcon").value("🌿"))
                .andExpect(jsonPath("$.rewardIcon").value("🎁"));
    }

    @Test
    void adminCanUpdateOwnBrandingOnly() throws Exception {
        String payload = objectMapper.writeValueAsString(Map.of(
                "colorPrimary", "#00AA88",
                "colorSecondary", "#222233",
                "backgroundUrl", "https://cdn.example.com/new-bg.jpg",
                "backgroundVisibility", 32,
                "backgroundBlur", 12,
                "stampIcon", "⭐",
                "rewardIcon", "🤍"
        ));

        mockMvc.perform(put("/api/v1/business/me")
                        .header("Authorization", bearer(adminAToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.colorPrimary").value("#00AA88"))
                .andExpect(jsonPath("$.backgroundUrl").value("https://cdn.example.com/new-bg.jpg"))
                .andExpect(jsonPath("$.backgroundVisibility").value(32))
                .andExpect(jsonPath("$.backgroundBlur").value(12))
                .andExpect(jsonPath("$.stampIcon").value("⭐"))
                .andExpect(jsonPath("$.rewardIcon").value("🤍"));

        Business other = businessRepository.findById(gymB.getId()).orElseThrow();
        org.assertj.core.api.Assertions.assertThat(other.getColorPrimary()).isNull();
        org.assertj.core.api.Assertions.assertThat(other.getBackgroundUrl()).isNull();
        org.assertj.core.api.Assertions.assertThat(other.getBackgroundVisibility()).isNull();
        org.assertj.core.api.Assertions.assertThat(other.getBackgroundBlur()).isNull();
        org.assertj.core.api.Assertions.assertThat(other.getStampIcon()).isNull();
        org.assertj.core.api.Assertions.assertThat(other.getRewardIcon()).isNull();
    }

    @Test
    void invalidBrandingColorIsRejected() throws Exception {
        String payload = objectMapper.writeValueAsString(Map.of("colorPrimary", "red"));

        mockMvc.perform(put("/api/v1/business/me")
                        .header("Authorization", bearer(adminAToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("validation_error"));
    }

    @Test
    void perTenantManifestUsesTenantBranding() throws Exception {
        mockMvc.perform(get("/api/public/tenants/cafe-a/manifest.webmanifest"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/manifest+json"))
                .andExpect(jsonPath("$.start_url").value("/cafe-a/login"))
                .andExpect(jsonPath("$.scope").value("/cafe-a/"))
                .andExpect(jsonPath("$.theme_color").value("#FF6B35"))
                .andExpect(jsonPath("$.background_color").value("#1A1A2E"))
                .andExpect(jsonPath("$.icons.length()").value(4))
                .andExpect(jsonPath("$.icons[0].sizes").value("192x192"))
                .andExpect(jsonPath("$.icons[2].purpose").value("maskable"));

        mockMvc.perform(get("/api/public/tenants/gym-b/manifest.webmanifest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.start_url").value("/gym-b/login"))
                .andExpect(jsonPath("$.scope").value("/gym-b/"));
    }

    @Test
    void platformAdminCanListBusinesses() throws Exception {
        mockMvc.perform(get("/api/v1/platform/businesses").header("Authorization", bearer(platformToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    void businessAdminCannotUsePlatformEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/platform/businesses").header("Authorization", bearer(adminAToken)))
                .andExpect(status().isForbidden());
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
