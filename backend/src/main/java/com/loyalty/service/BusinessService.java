package com.loyalty.service;

import com.loyalty.dto.BusinessDto;
import com.loyalty.entity.Business;
import com.loyalty.entity.User;
import com.loyalty.repository.BusinessRepository;
import com.loyalty.repository.LoyaltyCardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BusinessService {

    private final BusinessRepository businessRepository;
    private final LoyaltyCardRepository loyaltyCardRepository;

    public BusinessService(BusinessRepository businessRepository, LoyaltyCardRepository loyaltyCardRepository) {
        this.businessRepository = businessRepository;
        this.loyaltyCardRepository = loyaltyCardRepository;
    }

    public BusinessDto getMyBusiness(User owner) {
        Business business = businessRepository.findByOwner(owner)
                .orElseThrow(() -> new RuntimeException("No business found for this owner"));
        return mapToDto(business);
    }

    @Transactional
    public BusinessDto updateBusiness(User owner, BusinessDto request) {
        Business business = businessRepository.findByOwner(owner)
                .orElseThrow(() -> new RuntimeException("No business found for this owner"));

        if (request.getName() != null)              business.setName(request.getName());
        if (request.getDescription() != null)       business.setDescription(request.getDescription());
        if (request.getLogoUrl() != null)           business.setLogoUrl(request.getLogoUrl());
        if (request.getRewardDescription() != null) business.setRewardDescription(request.getRewardDescription());
        if (request.getStampsRequired() != null && request.getStampsRequired() > 0) {
            business.setStampsRequired(request.getStampsRequired());
        }

        Business saved = businessRepository.save(business);
        return mapToDto(saved);
    }

    private BusinessDto mapToDto(Business business) {
        long customerCount = loyaltyCardRepository.findAll().stream()
                .filter(c -> c.getBusiness().getId().equals(business.getId()))
                .count();

        return BusinessDto.builder()
                .id(business.getId())
                .name(business.getName())
                .description(business.getDescription())
                .logoUrl(business.getLogoUrl())
                .stampsRequired(business.getStampsRequired())
                .rewardDescription(business.getRewardDescription())
                .ownerId(business.getOwner().getId())
                .ownerName(business.getOwner().getFirstName() + " " + business.getOwner().getLastName())
                .totalCustomers((int) customerCount)
                .createdAt(business.getCreatedAt())
                .build();
    }
}
