package com.loyalty.service;

import com.loyalty.dto.business.RewardResponse;
import com.loyalty.entity.LoyaltyCard;
import com.loyalty.entity.Reward;
import com.loyalty.entity.User;
import com.loyalty.exception.ConflictException;
import com.loyalty.exception.NotFoundException;
import com.loyalty.repository.LoyaltyCardRepository;
import com.loyalty.repository.RewardRepository;
import com.loyalty.repository.UserRepository;
import com.loyalty.security.SecurityUser;
import com.loyalty.tenant.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class RewardService {

    private final RewardRepository rewardRepository;
    private final LoyaltyCardRepository loyaltyCardRepository;
    private final UserRepository userRepository;

    public RewardService(RewardRepository rewardRepository,
                         LoyaltyCardRepository loyaltyCardRepository,
                         UserRepository userRepository) {
        this.rewardRepository = rewardRepository;
        this.loyaltyCardRepository = loyaltyCardRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<RewardResponse> list(String status, Long cardId, int page, int size) {
        Long tenantId = TenantContext.requireTenantId();
        Pageable pageable = PageRequest.of(page, Math.min(size, 100),
                Sort.by(Sort.Direction.DESC, "earnedAt"));

        Reward.RewardStatus parsed = parseStatus(status);

        if (cardId != null) {
            loyaltyCardRepository.findByIdAndTenantId(cardId, tenantId)
                    .orElseThrow(() -> new NotFoundException("Loyalty card not found"));
            if (parsed == null) {
                return rewardRepository.findAllByTenantId(tenantId, pageable)
                        .map(this::toResponse);
            }
            return rewardRepository.findByTenantIdAndLoyaltyCardIdAndStatus(tenantId, cardId, parsed, pageable)
                    .map(this::toResponse);
        }

        if (parsed == null) {
            return rewardRepository.findAllByTenantId(tenantId, pageable).map(this::toResponse);
        }
        return rewardRepository.findByTenantIdAndStatus(tenantId, parsed, pageable).map(this::toResponse);
    }

    @Transactional
    public RewardResponse redeem(Long rewardId, SecurityUser admin) {
        Long tenantId = TenantContext.requireTenantId();

        Reward reward = rewardRepository.findByIdAndTenantId(rewardId, tenantId)
                .orElseThrow(() -> new NotFoundException("Reward not found"));

        if (reward.getStatus() != Reward.RewardStatus.AVAILABLE) {
            throw new ConflictException("reward_already_redeemed", "This reward was already redeemed");
        }

        User redeemedBy = userRepository.findByIdAndTenantId(admin.getId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Admin not found"));

        int updated = rewardRepository.markRedeemed(
                rewardId,
                tenantId,
                redeemedBy,
                LocalDateTime.now(),
                Reward.RewardStatus.REDEEMED,
                Reward.RewardStatus.AVAILABLE);

        if (updated == 0) {
            throw new ConflictException("reward_already_redeemed", "This reward was already redeemed");
        }

        closeCardIfNoPendingRewards(tenantId, reward.getLoyaltyCard().getId());

        Reward redeemed = rewardRepository.findByIdAndTenantId(rewardId, tenantId)
                .orElseThrow(() -> new NotFoundException("Reward not found"));
        return toResponse(redeemed);
    }

    private void closeCardIfNoPendingRewards(Long tenantId, Long cardId) {
        long available = rewardRepository.countByTenantIdAndLoyaltyCardIdAndStatus(
                tenantId, cardId, Reward.RewardStatus.AVAILABLE);
        if (available > 0) {
            return;
        }

        LoyaltyCard card = loyaltyCardRepository.findByIdAndTenantId(cardId, tenantId)
                .orElseThrow(() -> new NotFoundException("Loyalty card not found"));

        if (card.getStatus() == LoyaltyCard.CardStatus.REWARD_PENDING) {
            card.setStatus(LoyaltyCard.CardStatus.ACTIVE);
            loyaltyCardRepository.save(card);
        }
    }

    private RewardResponse toResponse(Reward reward) {
        LoyaltyCard card = reward.getLoyaltyCard();
        User customer = card.getUser();
        User redeemedBy = reward.getRedeemedBy();

        return RewardResponse.builder()
                .id(reward.getId())
                .cardId(card.getId())
                .customerName(customer.getFirstName() + " " + customer.getLastName())
                .description(reward.getDescription())
                .status(reward.getStatus().name())
                .earnedAt(reward.getEarnedAt())
                .redeemedAt(reward.getRedeemedAt())
                .redeemedBy(redeemedBy != null
                        ? redeemedBy.getFirstName() + " " + redeemedBy.getLastName()
                        : null)
                .build();
    }

    private Reward.RewardStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        try {
            return Reward.RewardStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new com.loyalty.exception.InvalidRequestException("Unknown reward status: " + status);
        }
    }
}
