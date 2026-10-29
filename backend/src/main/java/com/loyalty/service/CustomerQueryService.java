package com.loyalty.service;

import com.loyalty.dto.business.CustomerResponse;
import com.loyalty.entity.LoyaltyCard;
import com.loyalty.entity.User;
import com.loyalty.exception.NotFoundException;
import com.loyalty.repository.LoyaltyCardRepository;
import com.loyalty.repository.UserRepository;
import com.loyalty.tenant.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerQueryService {

    private final UserRepository userRepository;
    private final LoyaltyCardRepository loyaltyCardRepository;

    public CustomerQueryService(UserRepository userRepository,
                                LoyaltyCardRepository loyaltyCardRepository) {
        this.userRepository = userRepository;
        this.loyaltyCardRepository = loyaltyCardRepository;
    }

    @Transactional(readOnly = true)
    public Page<CustomerResponse> list(String query, int page, int size) {
        Long tenantId = TenantContext.requireTenantId();
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.ASC, "firstName"));

        Page<User> users = (query == null || query.isBlank())
                ? userRepository.findByTenantIdAndRole(tenantId, User.Role.CUSTOMER, pageable)
                : userRepository.searchByTenant(tenantId, User.Role.CUSTOMER, query.trim(), pageable);

        return users.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CustomerResponse get(Long userId) {
        Long tenantId = TenantContext.requireTenantId();
        User user = userRepository.findByIdAndTenantId(userId, tenantId)
                .filter(u -> u.getRole() == User.Role.CUSTOMER)
                .orElseThrow(() -> new NotFoundException("Customer not found"));
        return toResponse(user);
    }

    private CustomerResponse toResponse(User user) {
        LoyaltyCard card = loyaltyCardRepository.findByUserIdAndTenantId(user.getId(), user.getTenantId())
                .orElse(null);

        return CustomerResponse.builder()
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
