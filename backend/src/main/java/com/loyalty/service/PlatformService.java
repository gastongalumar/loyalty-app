package com.loyalty.service;

import com.loyalty.dto.platform.AdminResponse;
import com.loyalty.dto.platform.BusinessResponse;
import com.loyalty.dto.platform.BusinessSummary;
import com.loyalty.dto.platform.CreateAdminRequest;
import com.loyalty.dto.platform.CreateBusinessRequest;
import com.loyalty.dto.business.BusinessUpdateRequest;
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
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
public class PlatformService {

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final LoyaltyCardRepository loyaltyCardRepository;
    private final BusinessMapper businessMapper;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final QrCodeService qrCodeService;
    private final FileStorageService fileStorageService;

    public PlatformService(BusinessRepository businessRepository,
                           UserRepository userRepository,
                           LoyaltyCardRepository loyaltyCardRepository,
                           BusinessMapper businessMapper,
                           org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
                           QrCodeService qrCodeService,
                           FileStorageService fileStorageService) {
        this.businessRepository = businessRepository;
        this.userRepository = userRepository;
        this.loyaltyCardRepository = loyaltyCardRepository;
        this.businessMapper = businessMapper;
        this.passwordEncoder = passwordEncoder;
        this.qrCodeService = qrCodeService;
        this.fileStorageService = fileStorageService;
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
                .stampIcon(request.getStampIcon() != null && !request.getStampIcon().isBlank()
                        ? request.getStampIcon().trim()
                        : "☕")
                .rewardIcon(request.getRewardIcon() != null && !request.getRewardIcon().isBlank()
                        ? request.getRewardIcon().trim()
                        : "🏆")
                .backgroundVisibility(20)
                .backgroundBlur(8)
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
    public BusinessResponse updateBusiness(Long id, BusinessUpdateRequest request) {
        Business business = requireEditableBusiness(id);

        if (request.getName() != null) {
            business.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            business.setDescription(request.getDescription());
        }
        if (request.getLogoUrl() != null) {
            business.setLogoUrl(blankToNull(request.getLogoUrl()));
        }
        if (request.getBackgroundUrl() != null) {
            replaceBackground(business, request.getBackgroundUrl());
        }
        if (request.getBackgroundVisibility() != null) {
            business.setBackgroundVisibility(clamp(request.getBackgroundVisibility(), 0, 100));
        }
        if (request.getBackgroundBlur() != null) {
            business.setBackgroundBlur(clamp(request.getBackgroundBlur(), 0, 24));
        }
        if (request.getStampIcon() != null) {
            business.setStampIcon(blankToNull(request.getStampIcon()));
        }
        if (request.getRewardIcon() != null) {
            business.setRewardIcon(blankToNull(request.getRewardIcon()));
        }
        if (request.getColorPrimary() != null) {
            business.setColorPrimary(request.getColorPrimary().toUpperCase(Locale.ROOT));
        }
        if (request.getColorSecondary() != null) {
            business.setColorSecondary(request.getColorSecondary().toUpperCase(Locale.ROOT));
        }
        if (request.getRewardDescription() != null) {
            business.setRewardDescription(request.getRewardDescription());
        }
        if (request.getStampsRequired() != null && request.getStampsRequired() > 0) {
            business.setStampsRequired(request.getStampsRequired());
        }

        return toResponse(businessRepository.save(business));
    }

    @Transactional
    public BusinessResponse updateBackground(Long id, MultipartFile file) {
        Business business = requireEditableBusiness(id);
        String previous = business.getBackgroundUrl();
        String uploaded = fileStorageService.storeBackground(file);
        business.setBackgroundUrl(uploaded);
        Business saved = businessRepository.save(business);

        if (!Objects.equals(previous, uploaded)) {
            fileStorageService.deleteManaged(previous);
        }
        return toResponse(saved);
    }

    @Transactional
    public BusinessResponse removeBackground(Long id) {
        Business business = requireEditableBusiness(id);
        String previous = business.getBackgroundUrl();
        business.setBackgroundUrl(null);
        Business saved = businessRepository.save(business);
        fileStorageService.deleteManaged(previous);
        return toResponse(saved);
    }

    private void replaceBackground(Business business, String next) {
        String previous = business.getBackgroundUrl();
        String normalized = blankToNull(next);
        business.setBackgroundUrl(normalized);
        if (!Objects.equals(previous, normalized)) {
            fileStorageService.deleteManaged(previous);
        }
    }

    private Business requireEditableBusiness(Long id) {
        Business business = requireBusiness(id);
        if (business.getStatus() == Business.Status.DELETED) {
            throw new ConflictException("business_deleted", "A deleted business cannot be edited");
        }
        return business;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
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
}
