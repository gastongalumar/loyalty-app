package com.loyalty.service;

import com.loyalty.dto.CustomerDto;
import com.loyalty.dto.LoyaltyCardDto;
import com.loyalty.dto.LoyaltyCardDto.*;
import com.loyalty.entity.*;
import com.loyalty.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LoyaltyCardService {

    private final FidelityTierRepository fidelityTierRepository;
    private final FidelityRewardRepository fidelityRewardRepository;
    private final LoyaltyCardRepository loyaltyCardRepository;
    private final UserRepository userRepository;
    private final StampRepository stampRepository;
    private final RewardRepository rewardRepository;
    private final QrCodeService qrCodeService;

    public LoyaltyCardService(
            LoyaltyCardRepository loyaltyCardRepository,
            UserRepository userRepository,
            StampRepository stampRepository,
            RewardRepository rewardRepository,
            QrCodeService qrCodeService,
            FidelityTierRepository fidelityTierRepository,
            FidelityRewardRepository fidelityRewardRepository
    ) {
        this.loyaltyCardRepository = loyaltyCardRepository;
        this.userRepository = userRepository;
        this.stampRepository = stampRepository;
        this.rewardRepository = rewardRepository;
        this.qrCodeService = qrCodeService;
        this.fidelityTierRepository = fidelityTierRepository;
        this.fidelityRewardRepository = fidelityRewardRepository;
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

        // Complete a card cycle when stamps are filled
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

            // ✅ BUG FIX #2a: Check fidelity tiers every time a card completes
            checkAndGrantFidelityRewards(card);
        }

        loyaltyCardRepository.save(card);
        return mapToDto(card);
    }

    // ✅ BUG FIX #2b: New private helper — evaluates all eligible FidelityTiers
    // and creates FidelityReward records that were not already granted.
    private void checkAndGrantFidelityRewards(LoyaltyCard card) {
        List<FidelityTier> eligibleTiers = fidelityTierRepository
                .findEligibleTiers(card.getBusiness(), card.getCompletedCards());

        for (FidelityTier tier : eligibleTiers) {
            // Avoid duplicate rewards for the same tier
            boolean alreadyGranted = fidelityRewardRepository
                    .findByLoyaltyCardAndStatus(card, FidelityReward.RewardStatus.AVAILABLE)
                    .stream()
                    .anyMatch(fr -> fr.getTier().getId().equals(tier.getId()));

            if (!alreadyGranted) {
                FidelityReward fidelityReward = new FidelityReward();
                fidelityReward.setLoyaltyCard(card);
                fidelityReward.setTier(tier);
                fidelityReward.setDescription(tier.getRewardDescription());
                fidelityReward.setStatus(FidelityReward.RewardStatus.AVAILABLE);
                fidelityRewardRepository.save(fidelityReward);
            }
        }
    }

    @Transactional
    public LoyaltyCardDto scanQrAndAddStamp(String qrCode, String note, User addedBy) {
        User customer = userRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new RuntimeException("Customer not found for QR: " + qrCode));
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

    private CustomerDto mapUserToCustomerDto(User user) {
        return loyaltyCardRepository.findByUser(user)
                .map(card -> CustomerDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .phone(user.getPhone())
                        .qrCode(user.getQrCode())
                        .currentStamps(card.getCurrentStamps())
                        .totalStamps(card.getTotalStamps())
                        .completedCards(card.getCompletedCards())
                        .cardStatus(card.getStatus().name())
                        .memberSince(user.getCreatedAt())
                        .build())
                .orElseGet(() -> CustomerDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .phone(user.getPhone())
                        .memberSince(user.getCreatedAt())
                        .build());
    }

    // ✅ BUG FIX #2c: mapToDto now fetches FidelityRewards via the repository
    // (safe even if the @OneToMany on LoyaltyCard is lazy-loaded),
    // maps them to FidelityRewardDto, and populates the DTO list.
    private LoyaltyCardDto mapToDto(LoyaltyCard card) {
        LoyaltyCardDto dto = new LoyaltyCardDto();
        dto.setId(card.getId());
        dto.setUserId(card.getUser().getId());
        dto.setCustomerName(card.getUser().getFirstName() + " " + card.getUser().getLastName());
        dto.setCustomerEmail(card.getUser().getEmail());
        dto.setQrCode(card.getUser().getQrCode());
        dto.setBusinessName(card.getBusiness().getName());
        dto.setRewardDescription(card.getBusiness().getRewardDescription());
        dto.setCurrentStamps(card.getCurrentStamps());
        dto.setTotalStamps(card.getTotalStamps());
        dto.setCompletedCards(card.getCompletedCards());
        dto.setStatus(card.getStatus().name());
        dto.setCreatedAt(card.getCreatedAt());
        dto.setUpdatedAt(card.getUpdatedAt());

        // Recent stamps
        List<StampDto> stampDtos = stampRepository
                .findByLoyaltyCardIdOrderByCreatedAtDesc(card.getId())
                .stream()
                .limit(10)
                .map(s -> new StampDto(
                        s.getId(),
                        s.getNote(),
                        s.getAddedBy() != null
                                ? s.getAddedBy().getFirstName() + " " + s.getAddedBy().getLastName()
                                : "System",
                        s.getCreatedAt()))
                .collect(Collectors.toList());
        dto.setRecentStamps(stampDtos);

        // Standard card rewards
        List<RewardDto> rewardDtos = rewardRepository.findByLoyaltyCardId(card.getId())
                .stream()
                .map(r -> new RewardDto(
                        r.getId(),
                        r.getDescription(),
                        r.getStatus().name(),
                        r.getEarnedAt(),
                        r.getRedeemedAt()))
                .collect(Collectors.toList());
        dto.setRewards(rewardDtos);

        // ✅ BUG FIX #2c: Fidelity rewards — fetch directly from repo to avoid
        // LazyInitializationException and guarantee fresh data after addStamp().
        List<FidelityRewardDto> fidelityRewardDtos = fidelityRewardRepository
                .findByLoyaltyCardOrderByEarnedAtDesc(card)
                .stream()
                .map(fr -> new FidelityRewardDto(
                        fr.getId(),
                        fr.getDescription(),
                        fr.getStatus().name(),
                        fr.getTier() != null ? fr.getTier().getCardsRequired() : null,
                        fr.getEarnedAt(),
                        fr.getRedeemedAt()))
                .collect(Collectors.toList());
        dto.setFidelityRewards(fidelityRewardDtos);

        // ✅ BUG FIX #2d: Provide bonus progress data so the frontend can
        // render the "next fidelity milestone" progress bar without extra calls.
        populateBonusProgress(dto, card);

        return dto;
    }

    /**
     * Finds the next upcoming FidelityTier for this card's completedCards count
     * and sets bonusProgressPercent + nextBonusDescription on the DTO.
     */
    private void populateBonusProgress(LoyaltyCardDto dto, LoyaltyCard card) {
        List<FidelityTier> allTiers = fidelityTierRepository
                .findByBusinessAndIsActiveTrueOrderByCardsRequiredAsc(card.getBusiness());

        // Find first tier the customer hasn't yet FULLY cleared
        allTiers.stream()
                .filter(t -> t.getCardsRequired() > card.getCompletedCards())
                .findFirst()
                .ifPresent(nextTier -> {
                    int required = nextTier.getCardsRequired();
                    // Progress = completedCards / cardsRequired (capped 0–100)
                    int percent = (int) Math.min(100,
                            (card.getCompletedCards() * 100.0 / required));
                    dto.setBonusProgressPercent(percent);
                    dto.setNextBonusDescription(nextTier.getRewardDescription());
                    dto.setNextBonusCardsRequired(required);
                });
    }
}
