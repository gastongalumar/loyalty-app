package com.loyalty.service;

import com.loyalty.dto.business.BusinessUpdateRequest;
import com.loyalty.dto.platform.BusinessResponse;
import com.loyalty.entity.Business;
import com.loyalty.entity.User;
import com.loyalty.exception.NotFoundException;
import com.loyalty.mapper.BusinessMapper;
import com.loyalty.repository.BusinessRepository;
import com.loyalty.repository.LoyaltyCardRepository;
import com.loyalty.repository.UserRepository;
import com.loyalty.tenant.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BusinessService {

    private final BusinessRepository businessRepository;
    private final LoyaltyCardRepository loyaltyCardRepository;
    private final UserRepository userRepository;
    private final BusinessMapper businessMapper;

    public BusinessService(BusinessRepository businessRepository,
                           LoyaltyCardRepository loyaltyCardRepository,
                           UserRepository userRepository,
                           BusinessMapper businessMapper) {
        this.businessRepository = businessRepository;
        this.loyaltyCardRepository = loyaltyCardRepository;
        this.userRepository = userRepository;
        this.businessMapper = businessMapper;
    }

    @Transactional(readOnly = true)
    public BusinessResponse getMyBusiness() {
        return toResponse(requireTenantBusiness());
    }

    @Transactional
    public BusinessResponse updateMyBusiness(BusinessUpdateRequest request) {
        Business business = requireTenantBusiness();

        if (request.getName() != null) {
            business.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            business.setDescription(request.getDescription());
        }
        if (request.getLogoUrl() != null) {
            business.setLogoUrl(request.getLogoUrl());
        }
        if (request.getRewardDescription() != null) {
            business.setRewardDescription(request.getRewardDescription());
        }
        if (request.getStampsRequired() != null && request.getStampsRequired() > 0) {
            business.setStampsRequired(request.getStampsRequired());
        }

        return toResponse(businessRepository.save(business));
    }

    private Business requireTenantBusiness() {
        Long tenantId = TenantContext.requireTenantId();
        return businessRepository.findById(tenantId)
                .filter(b -> b.getStatus() != Business.Status.DELETED)
                .orElseThrow(() -> new NotFoundException("Business not found"));
    }

    private BusinessResponse toResponse(Business business) {
        BusinessResponse response = businessMapper.toResponse(business);
        response.setTotalCustomers((int) loyaltyCardRepository.countByTenantId(business.getId()));
        response.setTotalAdmins((int) userRepository.countByTenantIdAndRole(business.getId(), User.Role.BUSINESS_ADMIN));
        return response;
    }
}
