package com.loyalty.service;

import com.loyalty.dto.auth.AuthResponse;
import com.loyalty.dto.auth.LoginRequest;
import com.loyalty.dto.auth.RegisterRequest;
import com.loyalty.entity.Business;
import com.loyalty.entity.LoyaltyCard;
import com.loyalty.entity.User;
import com.loyalty.exception.ConflictException;
import com.loyalty.exception.InvalidRequestException;
import com.loyalty.exception.NotFoundException;
import com.loyalty.exception.TenantSuspendedException;
import com.loyalty.repository.BusinessRepository;
import com.loyalty.repository.LoyaltyCardRepository;
import com.loyalty.repository.UserRepository;
import com.loyalty.security.JwtService;
import com.loyalty.tenant.TenantContext;
import com.loyalty.tenant.TenantRef;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final LoyaltyCardRepository loyaltyCardRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final QrCodeService qrCodeService;

    public AuthService(UserRepository userRepository,
                       BusinessRepository businessRepository,
                       LoyaltyCardRepository loyaltyCardRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       QrCodeService qrCodeService) {
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.loyaltyCardRepository = loyaltyCardRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.qrCodeService = qrCodeService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        rejectNonCustomerRole(request.getRole());

        TenantRef tenant = TenantContext.get();
        if (tenant == null || tenant.id() == null) {
            throw new NotFoundException("Unknown business");
        }

        Business business = businessRepository.findById(tenant.id())
                .filter(b -> b.getStatus() == Business.Status.ACTIVE)
                .orElseThrow(() -> new NotFoundException("Unknown business"));

        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByTenantIdAndEmail(business.getId(), email)) {
            throw new ConflictException("email_taken", "Email already registered in this business");
        }

        User user = User.builder()
                .tenant(business)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .phone(request.getPhone())
                .role(User.Role.CUSTOMER)
                .qrCode(qrCodeService.generateQrCodeId())
                .build();

        User saved = userRepository.save(user);

        LoyaltyCard card = LoyaltyCard.builder()
                .tenantId(business.getId())
                .user(saved)
                .business(business)
                .totalStamps(business.getStampsRequired())
                .currentStamps(0)
                .completedCards(0)
                .status(LoyaltyCard.CardStatus.ACTIVE)
                .build();
        loyaltyCardRepository.save(card);

        return toResponse(saved, business);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        TenantRef tenant = TenantContext.get();

        User user;
        if (tenant != null && tenant.slug() != null) {
            Business business = businessRepository.findBySlug(tenant.slug())
                    .orElseThrow(() -> new NotFoundException("Unknown business"));
            if (business.getStatus() != Business.Status.ACTIVE) {
                throw new TenantSuspendedException();
            }
            user = userRepository.findByTenantIdAndEmail(business.getId(), email)
                    .filter(u -> u.getRole() != User.Role.PLATFORM_ADMIN)
                    .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        } else {
            user = userRepository.findByEmailAndTenantIsNull(email)
                    .filter(u -> u.getRole() == User.Role.PLATFORM_ADMIN)
                    .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        return toResponse(user, user.getTenant());
    }

    private void rejectNonCustomerRole(String role) {
        if (role != null && !role.isBlank() && !"CUSTOMER".equalsIgnoreCase(role.trim())) {
            throw new InvalidRequestException("role is not accepted on public registration");
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private AuthResponse toResponse(User user, Business business) {
        return AuthResponse.builder()
                .token(jwtService.generateToken(user))
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .userId(user.getId())
                .tenantId(business != null ? business.getId() : null)
                .tenantSlug(business != null ? business.getSlug() : null)
                .build();
    }
}
