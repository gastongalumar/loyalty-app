package com.loyalty.service;

import com.loyalty.dto.business.LoyaltyCardResponse;
import com.loyalty.dto.business.RewardResponse;
import com.loyalty.dto.business.StampResponse;
import com.loyalty.entity.LoyaltyCard;
import com.loyalty.entity.Reward;
import com.loyalty.entity.Stamp;
import com.loyalty.entity.User;
import com.loyalty.exception.ConflictException;
import com.loyalty.exception.NotFoundException;
import com.loyalty.repository.LoyaltyCardRepository;
import com.loyalty.repository.RewardRepository;
import com.loyalty.repository.StampRepository;
import com.loyalty.repository.UserRepository;
import com.loyalty.security.SecurityUser;
import com.loyalty.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LoyaltyCardService {

    private final LoyaltyCardRepository loyaltyCardRepository;
    private final UserRepository userRepository;
    private final StampRepository stampRepository;
    private final RewardRepository rewardRepository;
    private final QrCodeService qrCodeService;

    public LoyaltyCardService(LoyaltyCardRepository loyaltyCardRepository,
                              UserRepository userRepository,
                              StampRepository stampRepository,
                              RewardRepository rewardRepository,
                              QrCodeService qrCodeService) {
        this.loyaltyCardRepository = loyaltyCardRepository;
        this.userRepository = userRepository;
        this.stampRepository = stampRepository;
        this.rewardRepository = rewardRepository;
        this.qrCodeService = qrCodeService;
    }

    @Transactional(readOnly = true)
    public LoyaltyCardResponse getMyCard(SecurityUser principal) {
        return getCard(principal.getTenantId(), principal.getId());
    }

    @Transactional(readOnly = true)
    public LoyaltyCardResponse getCard(Long tenantId, Long userId) {
        requireCustomer(tenantId, userId);
        LoyaltyCard card = loyaltyCardRepository.findByUserIdAndTenantId(userId, tenantId)
                .orElseThrow(() -> new NotFoundException("Loyalty card not found"));
        return toResponse(card);
    }

    @Transactional(readOnly = true)
    public String getQrDataUri(Long tenantId, Long userId) {
        User customer = requireCustomer(tenantId, userId);
        return qrCodeService.generateQrCodeBase64(customer.getQrCode());
    }

    @Transactional
    public LoyaltyCardResponse addStamp(Long tenantId, Long userId, String note, SecurityUser admin) {
        User customer = requireCustomer(tenantId, userId);
        User addedBy = userRepository.findByIdAndTenantId(admin.getId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Admin not found"));

        LoyaltyCard card = loyaltyCardRepository.findByUserIdAndTenantId(customer.getId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Loyalty card not found"));

        if (card.getStatus() == LoyaltyCard.CardStatus.COMPLETED) {
            throw new ConflictException("card_completed", "This card is not accepting stamps");
        }

        Stamp stamp = Stamp.builder()
                .tenantId(tenantId)
                .loyaltyCard(card)
                .addedBy(addedBy)
                .note(note)
                .build();
        stampRepository.save(stamp);

        card.setCurrentStamps(card.getCurrentStamps() + 1);

        if (card.getCurrentStamps() >= card.getTotalStamps()) {
            Reward reward = Reward.builder()
                    .tenantId(tenantId)
                    .loyaltyCard(card)
                    .description(card.getBusiness().getRewardDescription())
                    .status(Reward.RewardStatus.AVAILABLE)
                    .build();
            rewardRepository.save(reward);

            card.setCompletedCards(card.getCompletedCards() + 1);
            card.setCurrentStamps(0);
            card.setStatus(LoyaltyCard.CardStatus.REWARD_PENDING);
        }

        return toResponse(loyaltyCardRepository.save(card));
    }

    @Transactional
    public LoyaltyCardResponse scanQrAndAddStamp(Long tenantId, String qrCode, String note, SecurityUser admin) {
        User customer = userRepository.findByQrCodeAndTenantId(qrCode.trim(), tenantId)
                .filter(u -> u.getRole() == User.Role.CUSTOMER)
                .orElseThrow(() -> new NotFoundException("Invalid QR code"));
        return addStamp(tenantId, customer.getId(), note, admin);
    }

    private User requireCustomer(Long tenantId, Long userId) {
        return userRepository.findByIdAndTenantId(userId, tenantId)
                .filter(u -> u.getRole() == User.Role.CUSTOMER)
                .orElseThrow(() -> new NotFoundException("Customer not found"));
    }

    private LoyaltyCardResponse toResponse(LoyaltyCard card) {
        Long tenantId = card.getTenantId();

        List<StampResponse> recentStamps = stampRepository
                .findByLoyaltyCardIdAndTenantIdOrderByCreatedAtDesc(card.getId(), tenantId)
                .stream()
                .limit(10)
                .map(stamp -> StampResponse.builder()
                        .id(stamp.getId())
                        .addedByName(stamp.getAddedBy().getFirstName() + " " + stamp.getAddedBy().getLastName())
                        .note(stamp.getNote())
                        .createdAt(stamp.getCreatedAt())
                        .build())
                .toList();

        List<RewardResponse> rewards = rewardRepository
                .findByLoyaltyCardIdAndTenantId(card.getId(), tenantId)
                .stream()
                .map(reward -> RewardResponse.builder()
                        .id(reward.getId())
                        .description(reward.getDescription())
                        .status(reward.getStatus().name())
                        .earnedAt(reward.getEarnedAt())
                        .redeemedAt(reward.getRedeemedAt())
                        .build())
                .toList();

        return LoyaltyCardResponse.builder()
                .id(card.getId())
                .userId(card.getUser().getId())
                .customerName(card.getUser().getFirstName() + " " + card.getUser().getLastName())
                .customerEmail(card.getUser().getEmail())
                .qrCode(card.getUser().getQrCode())
                .businessName(card.getBusiness().getName())
                .rewardDescription(card.getBusiness().getRewardDescription())
                .stampIcon(card.getBusiness().getStampIcon())
                .rewardIcon(card.getBusiness().getRewardIcon())
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
}
