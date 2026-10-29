package com.loyalty.service;

import com.loyalty.dto.business.LoyaltyCardResponse;
import com.loyalty.entity.Business;
import com.loyalty.entity.LoyaltyCard;
import com.loyalty.entity.Reward;
import com.loyalty.entity.Stamp;
import com.loyalty.entity.User;
import com.loyalty.exception.NotFoundException;
import com.loyalty.repository.LoyaltyCardRepository;
import com.loyalty.repository.RewardRepository;
import com.loyalty.repository.StampRepository;
import com.loyalty.repository.UserRepository;
import com.loyalty.security.SecurityUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoyaltyCardServiceTest {

    @Mock private LoyaltyCardRepository loyaltyCardRepository;
    @Mock private UserRepository userRepository;
    @Mock private StampRepository stampRepository;
    @Mock private RewardRepository rewardRepository;
    @Mock private QrCodeService qrCodeService;

    @InjectMocks private LoyaltyCardService loyaltyCardService;

    private static final Long TENANT = 10L;
    private static final Long OTHER_TENANT = 20L;

    private User customer;
    private User admin;
    private Business business;
    private LoyaltyCard card;
    private SecurityUser adminPrincipal;

    @BeforeEach
    void setUp() {
        business = Business.builder()
                .id(TENANT).slug("cafe-a").name("Cafe A")
                .stampsRequired(10).rewardDescription("Free coffee")
                .status(Business.Status.ACTIVE)
                .build();

        customer = User.builder()
                .id(1L).email("customer@test.com").password("encoded")
                .firstName("Jane").lastName("Customer")
                .role(User.Role.CUSTOMER).qrCode("QRCUSTOMER")
                .tenant(business).tenantId(TENANT)
                .build();

        admin = User.builder()
                .id(2L).email("admin@test.com").password("encoded")
                .firstName("Admin").lastName("User")
                .role(User.Role.BUSINESS_ADMIN).qrCode("QRADMIN")
                .tenant(business).tenantId(TENANT)
                .build();

        card = LoyaltyCard.builder()
                .id(1L).tenantId(TENANT).user(customer).business(business)
                .totalStamps(10).currentStamps(5).completedCards(0)
                .status(LoyaltyCard.CardStatus.ACTIVE)
                .build();

        adminPrincipal = new SecurityUser(2L, "admin@test.com", "encoded",
                User.Role.BUSINESS_ADMIN, TENANT, "cafe-a");
    }

    @Test
    void shouldReturnCardForOwningTenant() {
        when(userRepository.findByIdAndTenantId(1L, TENANT)).thenReturn(Optional.of(customer));
        when(loyaltyCardRepository.findByUserIdAndTenantId(1L, TENANT)).thenReturn(Optional.of(card));
        when(stampRepository.findByLoyaltyCardIdAndTenantIdOrderByCreatedAtDesc(1L, TENANT))
                .thenReturn(Collections.emptyList());
        when(rewardRepository.findByLoyaltyCardIdAndTenantId(1L, TENANT))
                .thenReturn(Collections.emptyList());

        LoyaltyCardResponse response = loyaltyCardService.getCard(TENANT, 1L);

        assertThat(response.getCurrentStamps()).isEqualTo(5);
        assertThat(response.getBusinessName()).isEqualTo("Cafe A");
    }

    @Test
    void shouldThrow404ForAnotherTenant() {
        when(userRepository.findByIdAndTenantId(1L, OTHER_TENANT)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> loyaltyCardService.getCard(OTHER_TENANT, 1L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void shouldAddStamp() {
        when(userRepository.findByIdAndTenantId(1L, TENANT)).thenReturn(Optional.of(customer));
        when(userRepository.findByIdAndTenantId(2L, TENANT)).thenReturn(Optional.of(admin));
        when(loyaltyCardRepository.findByUserIdAndTenantId(1L, TENANT)).thenReturn(Optional.of(card));
        when(stampRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(loyaltyCardRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(stampRepository.findByLoyaltyCardIdAndTenantIdOrderByCreatedAtDesc(1L, TENANT))
                .thenReturn(Collections.emptyList());
        when(rewardRepository.findByLoyaltyCardIdAndTenantId(1L, TENANT))
                .thenReturn(Collections.emptyList());

        LoyaltyCardResponse response = loyaltyCardService.addStamp(TENANT, 1L, "latte", adminPrincipal);

        assertThat(response.getCurrentStamps()).isEqualTo(6);
        verify(stampRepository).save(any(Stamp.class));
    }

    @Test
    void shouldGrantRewardAndResetCounter() {
        card.setCurrentStamps(9);
        when(userRepository.findByIdAndTenantId(1L, TENANT)).thenReturn(Optional.of(customer));
        when(userRepository.findByIdAndTenantId(2L, TENANT)).thenReturn(Optional.of(admin));
        when(loyaltyCardRepository.findByUserIdAndTenantId(1L, TENANT)).thenReturn(Optional.of(card));
        when(stampRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(rewardRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(loyaltyCardRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(stampRepository.findByLoyaltyCardIdAndTenantIdOrderByCreatedAtDesc(1L, TENANT))
                .thenReturn(Collections.emptyList());
        when(rewardRepository.findByLoyaltyCardIdAndTenantId(1L, TENANT))
                .thenReturn(Collections.emptyList());

        loyaltyCardService.addStamp(TENANT, 1L, null, adminPrincipal);

        verify(rewardRepository).save(any(Reward.class));
        assertThat(card.getCurrentStamps()).isZero();
        assertThat(card.getCompletedCards()).isEqualTo(1);
        assertThat(card.getStatus()).isEqualTo(LoyaltyCard.CardStatus.REWARD_PENDING);
    }

    @Test
    void shouldRejectQrFromAnotherTenant() {
        when(userRepository.findByQrCodeAndTenantId("QRB", OTHER_TENANT)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> loyaltyCardService.scanQrAndAddStamp(OTHER_TENANT, "QRB", null, adminPrincipal))
                .isInstanceOf(NotFoundException.class);
    }
}
