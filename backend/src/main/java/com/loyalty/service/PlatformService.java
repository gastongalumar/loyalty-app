package com.loyalty.service;

import com.loyalty.dto.platform.AdminResponse;
import com.loyalty.dto.platform.BusinessResponse;
import com.loyalty.dto.platform.BusinessSummary;
import com.loyalty.dto.platform.CreateAdminRequest;
import com.loyalty.dto.platform.CreateBusinessRequest;
import com.loyalty.entity.Business;
import com.loyalty.entity.User;
import com.loyalty.exception.ConflictException;
import com.loyalty.exception.NotFoundException;
import com.loyalty.mapper.BusinessMapper;
import com.loyalty.repository.BusinessRepository;
import com.loyalty.repository.LoyaltyCardRepository;
import com.loyalty.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class PlatformService {

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final LoyaltyCardRepository loyaltyCardRepository;
    private final BusinessMapper businessMapper;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final QrCodeService qrCodeService;

    public PlatformService(BusinessRepository businessRepository,
                           UserRepository userRepository,
                           LoyaltyCardRepository loyaltyCardRepository,
                           BusinessMapper businessMapper,
                           org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
                           QrCodeService qrCodeService) {
        this.businessRepository = businessRepository;
        this.userRepository = userRepository;
        this.loyaltyCardRepository = loyaltyCardRepository;
        this.businessMapper = businessMapper;
        this.passwordEncoder = passwordEncoder;
        this.qrCodeService = qrCodeService;
    }

    @Transactional
    public BusinessResponse createBusiness(CreateBusinessRequest request) {
        String slug = request.getSlug().trim().toLowerCase(Locale.ROOT);
        if (businessRepository.existsBySlug(slug)) {
            throw new ConflictException("slug_taken", "Slug already in use");
        }

        Business business = Business.builder()
                .name(request.getName().trim())
                .slug(slug)
                .description(request.getDescription())
                .stampsRequired(request.getStampsRequired() != null ? request.getStampsRequired() : 10)
                .rewardDescription(request.getRewardDescription() != null
                        ? request.getRewardDescription()
                        : "Complete your card and get a reward")
                .status(Business.Status.ACTIVE)
                .build();

        return toResponse(businessRepository.save(business));
    }

    @Transactional(readOnly = true)
    public Page<BusinessSummary> listBusinesses(String status, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "id"));
        Business.Status parsed = parseStatus(status);
        return businessRepository.search(parsed, blankToNull(query), pageable)
                .map(business -> {
                    BusinessSummary summary = businessMapper.toSummary(business);
                    summary.setTotalCustomers((int) loyaltyCardRepository.countByTenantId(business.getId()));
                    return summary;
                });
    }

    @Transactional(readOnly = true)
    public BusinessResponse getBusiness(Long id) {
        return toResponse(requireBusiness(id));
    }

    @Transactional
    public BusinessResponse updateStatus(Long id, String status) {
        Business business = requireBusiness(id);
        if (business.getStatus() == Business.Status.DELETED) {
            throw new ConflictException("business_deleted", "A deleted business cannot change status");
        }
        business.setStatus(Business.Status.valueOf(status));
        return toResponse(businessRepository.save(business));
    }

    @Transactional
    public void softDelete(Long id) {
        Business business = requireBusiness(id);
        if (business.getStatus() == Business.Status.DELETED) {
            throw new ConflictException("business_deleted", "Business already deleted");
        }
        business.setStatus(Business.Status.DELETED);
        business.setDeletedAt(LocalDateTime.now());
        businessRepository.save(business);
    }

    @Transactional
    public AdminResponse createAdmin(Long businessId, CreateAdminRequest request) {
        Business business = requireBusiness(businessId);
        if (business.getStatus() == Business.Status.DELETED) {
            throw new ConflictException("business_deleted", "Cannot create admins for a deleted business");
        }

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByTenantIdAndEmail(business.getId(), email)) {
            throw new ConflictException("email_taken", "Email already registered in this business");
        }

        User admin = User.builder()
                .tenant(business)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .phone(request.getPhone())
                .role(User.Role.BUSINESS_ADMIN)
                .qrCode(qrCodeService.generateQrCodeId())
                .build();

        return businessMapper.toAdminResponse(userRepository.save(admin));
    }

    @Transactional(readOnly = true)
    public List<AdminResponse> listAdmins(Long businessId) {
        requireBusiness(businessId);
        return userRepository.findByTenantIdAndRole(businessId, User.Role.BUSINESS_ADMIN, Pageable.unpaged())
                .stream()
                .map(businessMapper::toAdminResponse)
                .toList();
    }

    private Business requireBusiness(Long id) {
        return businessRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Business not found"));
    }

    private BusinessResponse toResponse(Business business) {
        BusinessResponse response = businessMapper.toResponse(business);
        response.setTotalCustomers((int) loyaltyCardRepository.countByTenantId(business.getId()));
        response.setTotalAdmins((int) userRepository.countByTenantIdAndRole(business.getId(), User.Role.BUSINESS_ADMIN));
        return response;
    }

    private Business.Status parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        try {
            return Business.Status.valueOf(status.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new com.loyalty.exception.InvalidRequestException("Unknown status: " + status);
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
