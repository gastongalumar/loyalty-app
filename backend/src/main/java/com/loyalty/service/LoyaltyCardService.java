package com.loyalty.service;

import com.loyalty.dto.CustomerDto;
import com.loyalty.dto.LoyaltyCardDto;
import com.loyalty.entity.*;
import com.loyalty.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LoyaltyCardService {

    private final LoyaltyCardRepository loyaltyCardRepository;
    private final UserRepository userRepository;
    private final StampRepository stampRepository;
    private final RewardRepository rewardRepository;
    private final QrCodeService qrCodeService;

    public LoyaltyCardService(LoyaltyCardRepository loyaltyCardRepository, UserRepository userRepository, StampRepository stampRepository, RewardRepository rewardRepository, QrCodeService qrCodeService) {
        this.loyaltyCardRepository = loyaltyCardRepository;
        this.userRepository = userRepository;
        this.stampRepository = stampRepository;
        this.rewardRepository = rewardRepository;
        this.qrCodeService = qrCodeService;
    }

    public LoyaltyCardDto getLoyaltyCard(Long userId) {
        LoyaltyCard card = loyaltyCardRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Loyalty card not found"));
        return mapToDto(card);
    }

    public String getQrCodeImage(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return qrCodeService.generateQrCodeBase64(user.getQrCode());
    }

    @Transactional
    public LoyaltyCardDto addStamp(Long userId, String note, User addedBy) {
        LoyaltyCard card = loyaltyCardRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Loyalty card not found"));

        Stamp stamp = Stamp.builder()
                .loyaltyCard(card)
                .addedBy(addedBy)
                .note(note)
                .build();

        stampRepository.save(stamp);
        card.setCurrentStamps(card.getCurrentStamps() + 1);

        if (card.getCurrentStamps() >= card.getTotalStamps()) {
            Reward reward = Reward.builder()
                    .loyaltyCard(card)
                    .description(card.getBusiness().getRewardDescription())
                    .status(Reward.RewardStatus.AVAILABLE)
                    .build();
            rewardRepository.save(reward);

            card.setCompletedCards(card.getCompletedCards() + 1);
            card.setCurrentStamps(0);
            card.setStatus(LoyaltyCard.CardStatus.REWARD_PENDING);
        }

        loyaltyCardRepository.save(card);
        return mapToDto(card);
    }

    @Transactional
    public LoyaltyCardDto scanQrAndAddStamp(String qrCode, String note, User addedBy) {
        User customer = userRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new RuntimeException("Invalid QR code"));
        return addStamp(customer.getId(), note, addedBy);
    }

    public List<CustomerDto> getAllCustomers() {
        return userRepository.findAllCustomers().stream()
                .map(this::mapUserToCustomerDto)
                .collect(Collectors.toList());
    }

    public List<CustomerDto> searchCustomers(String query) {
        return userRepository.searchCustomers(query).stream()
                .map(this::mapUserToCustomerDto)
                .collect(Collectors.toList());
    }

    private LoyaltyCardDto mapToDto(LoyaltyCard card) {
        List<LoyaltyCardDto.StampDto> recentStamps = stampRepository
                .findByLoyaltyCardIdOrderByCreatedAtDesc(card.getId())
                .stream()
                .limit(10)
                .map(s -> LoyaltyCardDto.StampDto.builder()
                        .id(s.getId())
                        .addedByName(s.getAddedBy().getFirstName() + " " + s.getAddedBy().getLastName())
                        .note(s.getNote())
                        .createdAt(s.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        List<LoyaltyCardDto.RewardDto> rewards = rewardRepository
                .findByLoyaltyCardId(card.getId())
                .stream()
                .map(r -> LoyaltyCardDto.RewardDto.builder()
                        .id(r.getId())
                        .description(r.getDescription())
                        .status(r.getStatus().name())
                        .earnedAt(r.getEarnedAt())
                        .redeemedAt(r.getRedeemedAt())
                        .build())
                .collect(Collectors.toList());

        return LoyaltyCardDto.builder()
                .id(card.getId())
                .userId(card.getUser().getId())
                .customerName(card.getUser().getFirstName() + " " + card.getUser().getLastName())
                .customerEmail(card.getUser().getEmail())
                .qrCode(card.getUser().getQrCode())
                .businessName(card.getBusiness().getName())
                .rewardDescription(card.getBusiness().getRewardDescription())
                .currentStamps(card.getCurrentStamps())
                .totalStamps(card.getTotalStamps())
                .completedCards(card.getCompletedCards())
                .status(card.getStatus().name())
                .createdAt(card.getCreatedAt())
                .updatedAt(card.getUpdatedAt())
                .recentStamps(recentStamps)
                .rewards(rewards)
                .build();
    }

    private CustomerDto mapUserToCustomerDto(User user) {
        LoyaltyCard card = loyaltyCardRepository.findByUserId(user.getId()).orElse(null);
        return CustomerDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .qrCode(user.getQrCode())
                .currentStamps(card != null ? card.getCurrentStamps() : 0)
                .totalStamps(card != null ? card.getTotalStamps() : 0)
                .completedCards(card != null ? card.getCompletedCards() : 0)
                .cardStatus(card != null ? card.getStatus().name() : "NO_CARD")
                .memberSince(user.getCreatedAt())
                .build();
    }
}
