package com.loyalty.service;

import com.loyalty.dto.LoyaltyCardDto;
import com.loyalty.entity.*;
import com.loyalty.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
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

    @InjectMocks
    private LoyaltyCardService loyaltyCardService;

    private User customer;
    private User admin;
    private Business business;
    private LoyaltyCard loyaltyCard;

    @BeforeEach
    void setUp() {
        business = Business.builder()
                .id(1L)
                .name("Test Coffee Shop")
                .stampsRequired(10)
                .rewardDescription("Free coffee!")
                .build();

        customer = User.builder()
                .id(1L)
                .email("customer@test.com")
                .firstName("Jane")
                .lastName("Customer")
                .role(User.Role.CUSTOMER)
                .qrCode("TESTQR123")
                .build();

        admin = User.builder()
                .id(2L)
                .email("admin@test.com")
                .firstName("Admin")
                .lastName("User")
                .role(User.Role.BUSINESS_OWNER)
                .qrCode("ADMINQR")
                .build();

        loyaltyCard = LoyaltyCard.builder()
                .id(1L)
                .user(customer)
                .business(business)
                .totalStamps(10)
                .currentStamps(5)
                .completedCards(0)
                .status(LoyaltyCard.CardStatus.ACTIVE)
                .build();
    }

    @Test
    void shouldGetLoyaltyCard() {
        when(loyaltyCardRepository.findByUserId(1L)).thenReturn(Optional.of(loyaltyCard));
        when(stampRepository.findByLoyaltyCardIdOrderByCreatedAtDesc(1L)).thenReturn(Collections.emptyList());
        when(rewardRepository.findByLoyaltyCardId(1L)).thenReturn(Collections.emptyList());

        LoyaltyCardDto result = loyaltyCardService.getLoyaltyCard(1L);

        assertThat(result).isNotNull();
        assertThat(result.getCurrentStamps()).isEqualTo(5);
        assertThat(result.getTotalStamps()).isEqualTo(10);
        assertThat(result.getCustomerName()).isEqualTo("Jane Customer");
    }

    @Test
    void shouldThrowWhenCardNotFound() {
        when(loyaltyCardRepository.findByUserId(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> loyaltyCardService.getLoyaltyCard(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void shouldAddStamp() {
        when(loyaltyCardRepository.findByUserId(1L)).thenReturn(Optional.of(loyaltyCard));
        when(stampRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(loyaltyCardRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(stampRepository.findByLoyaltyCardIdOrderByCreatedAtDesc(1L)).thenReturn(Collections.emptyList());
        when(rewardRepository.findByLoyaltyCardId(1L)).thenReturn(Collections.emptyList());

        LoyaltyCardDto result = loyaltyCardService.addStamp(1L, "Nice latte", admin);

        assertThat(result.getCurrentStamps()).isEqualTo(6);
        verify(stampRepository).save(any(Stamp.class));
        verify(loyaltyCardRepository).save(any(LoyaltyCard.class));
    }

    @Test
    void shouldGrantRewardWhenStampsComplete() {
        loyaltyCard.setCurrentStamps(9); // One away from reward

        when(loyaltyCardRepository.findByUserId(1L)).thenReturn(Optional.of(loyaltyCard));
        when(stampRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(rewardRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(loyaltyCardRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(stampRepository.findByLoyaltyCardIdOrderByCreatedAtDesc(1L)).thenReturn(Collections.emptyList());
        when(rewardRepository.findByLoyaltyCardId(1L)).thenReturn(Collections.emptyList());

        loyaltyCardService.addStamp(1L, null, admin);

        // Stamps reset to 0, completedCards increments, reward created
        verify(rewardRepository).save(any(Reward.class));
        assertThat(loyaltyCard.getCurrentStamps()).isEqualTo(0);
        assertThat(loyaltyCard.getCompletedCards()).isEqualTo(1);
        assertThat(loyaltyCard.getStatus()).isEqualTo(LoyaltyCard.CardStatus.REWARD_PENDING);
    }

    @Test
    void shouldScanQrAndAddStamp() {
        when(userRepository.findByQrCode("TESTQR123")).thenReturn(Optional.of(customer));
        when(loyaltyCardRepository.findByUserId(1L)).thenReturn(Optional.of(loyaltyCard));
        when(stampRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(loyaltyCardRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(stampRepository.findByLoyaltyCardIdOrderByCreatedAtDesc(1L)).thenReturn(Collections.emptyList());
        when(rewardRepository.findByLoyaltyCardId(1L)).thenReturn(Collections.emptyList());

        LoyaltyCardDto result = loyaltyCardService.scanQrAndAddStamp("TESTQR123", "Espresso", admin);

        assertThat(result).isNotNull();
        assertThat(result.getCurrentStamps()).isEqualTo(6);
    }

    @Test
    void shouldThrowForInvalidQrCode() {
        when(userRepository.findByQrCode("BADCODE")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> loyaltyCardService.scanQrAndAddStamp("BADCODE", null, admin))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid QR code");
    }

    @Test
    void shouldReturnAllCustomers() {
        when(userRepository.findAllCustomers()).thenReturn(List.of(customer));
        when(loyaltyCardRepository.findByUserId(1L)).thenReturn(Optional.of(loyaltyCard));

        var result = loyaltyCardService.getAllCustomers();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail()).isEqualTo("customer@test.com");
        assertThat(result.get(0).getCurrentStamps()).isEqualTo(5);
    }

    @Test
    void shouldSearchCustomers() {
        when(userRepository.searchCustomers("jane")).thenReturn(List.of(customer));
        when(loyaltyCardRepository.findByUserId(1L)).thenReturn(Optional.of(loyaltyCard));

        var result = loyaltyCardService.searchCustomers("jane");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getFirstName()).isEqualTo("Jane");
    }
}
