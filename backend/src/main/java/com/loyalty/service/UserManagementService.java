package com.loyalty.service;

import com.loyalty.dto.AuthDto;
import com.loyalty.dto.CustomerDto;
import com.loyalty.dto.UserManagementDto;
import com.loyalty.entity.Business;
import com.loyalty.entity.LoyaltyCard;
import com.loyalty.entity.User;
import com.loyalty.repository.BusinessRepository;
import com.loyalty.repository.LoyaltyCardRepository;
import com.loyalty.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserManagementService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final LoyaltyCardRepository loyaltyCardRepository;
    private final PasswordEncoder passwordEncoder;
    private final QrCodeService qrCodeService;

    public UserManagementService(UserRepository userRepository,
                                  BusinessRepository businessRepository,
                                  LoyaltyCardRepository loyaltyCardRepository,
                                  PasswordEncoder passwordEncoder,
                                  QrCodeService qrCodeService) {
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.loyaltyCardRepository = loyaltyCardRepository;
        this.passwordEncoder = passwordEncoder;
        this.qrCodeService = qrCodeService;
    }

    // List ALL users (customers + admins)
    public List<UserManagementDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // Create a new user with any role (admin only)
    @Transactional
    public UserManagementDto createUser(UserManagementDto.CreateRequest request) {
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

        User saved = userRepository.save(user);

        if (role == User.Role.CUSTOMER) {
            Business business = businessRepository.findAll().stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No business configured yet"));

            LoyaltyCard card = LoyaltyCard.builder()
                    .user(saved)
                    .business(business)
                    .totalStamps(business.getStampsRequired())
                    .currentStamps(0)
                    .completedCards(0)
                    .status(LoyaltyCard.CardStatus.ACTIVE)
                    .build();
            loyaltyCardRepository.save(card);

        } else if (role == User.Role.BUSINESS_OWNER) {
            Business business = Business.builder()
                    .name(request.getFirstName() + "'s Coffee Shop")
                    .description("Welcome to our loyalty program!")
                    .stampsRequired(10)
                    .rewardDescription("Buy 10 coffees, get 1 FREE!")
                    .owner(saved)
                    .build();
            businessRepository.save(business);
        }

        return toDto(saved);
    }

    // Update role of existing user
    @Transactional
    public UserManagementDto updateUserRole(Long userId, String newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(User.Role.valueOf(newRole.toUpperCase()));
        return toDto(userRepository.save(user));
    }

    // Delete user
    @Transactional
    public void deleteUser(Long userId, User requestingAdmin) {
        if (userId.equals(requestingAdmin.getId())) {
            throw new IllegalArgumentException("You cannot delete your own account");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }

    private UserManagementDto toDto(User user) {
        UserManagementDto dto = new UserManagementDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole().name());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
