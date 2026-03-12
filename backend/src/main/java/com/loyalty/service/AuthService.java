package com.loyalty.service;

import com.loyalty.dto.AuthDto;
import com.loyalty.entity.Business;
import com.loyalty.entity.LoyaltyCard;
import com.loyalty.entity.User;
import com.loyalty.repository.BusinessRepository;
import com.loyalty.repository.LoyaltyCardRepository;
import com.loyalty.repository.UserRepository;
import com.loyalty.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final LoyaltyCardRepository loyaltyCardRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final QrCodeService qrCodeService;

    public AuthService(UserRepository userRepository, BusinessRepository businessRepository, LoyaltyCardRepository loyaltyCardRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager, QrCodeService qrCodeService) {
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.loyaltyCardRepository = loyaltyCardRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.qrCodeService = qrCodeService;
    }

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User.Role role = User.Role.valueOf(request.getRole().toUpperCase());
        String qrCodeId = qrCodeService.generateQrCodeId();

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role(role)
                .qrCode(qrCodeId)
                .build();

        User savedUser = userRepository.save(user);

        if (role == User.Role.CUSTOMER) {
            // Get the default business (first business, or create one)
            Business business = businessRepository.findAll().stream()
                    .findFirst()
                    .orElseGet(() -> createDefaultBusiness(savedUser));

            LoyaltyCard loyaltyCard = LoyaltyCard.builder()
                    .user(savedUser)
                    .business(business)
                    .totalStamps(business.getStampsRequired())
                    .currentStamps(0)
                    .completedCards(0)
                    .status(LoyaltyCard.CardStatus.ACTIVE)
                    .build();

            loyaltyCardRepository.save(loyaltyCard);
        } else if (role == User.Role.BUSINESS_OWNER) {
            Business business = Business.builder()
                    .name(request.getFirstName() + "'s Coffee Shop")
                    .description("Welcome to our loyalty program!")
                    .stampsRequired(10)
                    .rewardDescription("Buy 10 coffees, get 1 FREE!")
                    .owner(savedUser)
                    .build();
            businessRepository.save(business);
        }

        String jwtToken = jwtService.generateToken(savedUser);
        return new AuthDto.AuthResponse(
                jwtToken, savedUser.getEmail(),
                savedUser.getFirstName(), savedUser.getLastName(),
                savedUser.getRole().name(), savedUser.getId()
        );
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String jwtToken = jwtService.generateToken(user);
        return new AuthDto.AuthResponse(
                jwtToken, user.getEmail(),
                user.getFirstName(), user.getLastName(),
                user.getRole().name(), user.getId()
        );
    }

    private Business createDefaultBusiness(User owner) {
        Business business = Business.builder()
                .name("Loyalty Coffee Shop")
                .description("Your neighborhood coffee shop")
                .stampsRequired(10)
                .rewardDescription("Buy 10 coffees, get 1 FREE!")
                .owner(owner)
                .build();
        return businessRepository.save(business);
    }
}
