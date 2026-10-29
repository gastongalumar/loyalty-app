package com.loyalty.service;

import com.loyalty.dto.publicapi.TenantPublicResponse;
import com.loyalty.entity.Business;
import com.loyalty.exception.NotFoundException;
import com.loyalty.repository.BusinessRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PublicTenantService {

    private final BusinessRepository businessRepository;

    public PublicTenantService(BusinessRepository businessRepository) {
        this.businessRepository = businessRepository;
    }

    @Transactional(readOnly = true)
    public TenantPublicResponse getBySlug(String slug) {
        Business business = businessRepository.findBySlug(slug.toLowerCase())
                .filter(b -> b.getStatus() != Business.Status.DELETED)
                .orElseThrow(() -> new NotFoundException("Unknown business"));

        return TenantPublicResponse.builder()
                .slug(business.getSlug())
                .name(business.getName())
                .status(business.getStatus().name())
                .build();
    }
}
