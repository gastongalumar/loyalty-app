package com.loyalty.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.loyalty.dto.auth.LoginRequest;
import com.loyalty.dto.auth.RegisterRequest;
import com.loyalty.entity.Business;
import com.loyalty.entity.User;
import com.loyalty.repository.BusinessRepository;
import com.loyalty.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Business cafeA;
    private Business gymB;

    @BeforeEach
    void setUp() {
        cafeA = businessRepository.save(Business.builder()
                .name("Cafe A").slug("cafe-a")
                .stampsRequired(10).rewardDescription("Free coffee")
                .status(Business.Status.ACTIVE)
                .build());
        gymB = businessRepository.save(Business.builder()
                .name("Gym B").slug("gym-b")
                .stampsRequired(8).rewardDescription("Free month")
                .status(Business.Status.ACTIVE)
                .build());
    }

    @Test
    void shouldRegisterCustomerInTenant() throws Exception {
        RegisterRequest request = registerRequest("newuser@test.com", null);

        mockMvc.perform(post("/api/auth/register")
                        .header("X-Tenant-Slug", "cafe-a")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.tenantSlug").value("cafe-a"))
                .andExpect(jsonPath("$.tenantId").value(cafeA.getId()));
    }

    @Test
    void shouldRejectNonCustomerRole() throws Exception {
        RegisterRequest request = registerRequest("attacker@test.com", "BUSINESS_ADMIN");

        mockMvc.perform(post("/api/auth/register")
                        .header("X-Tenant-Slug", "cafe-a")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("invalid_request"));

        assertThat(userRepository.findByTenantIdAndEmail(cafeA.getId(), "attacker@test.com")).isEmpty();
    }

    @Test
    void shouldRejectRegistrationWithoutTenantSlug() throws Exception {
        RegisterRequest request = registerRequest("nobody@test.com", null);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());

        assertThat(userRepository.findByEmailAndTenantIsNull("nobody@test.com")).isEmpty();
    }

    @Test
    void shouldNotCreateBusinessOnCustomerRegistration() throws Exception {
        long before = businessRepository.count();

        mockMvc.perform(post("/api/auth/register")
                        .header("X-Tenant-Slug", "cafe-a")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest("c1@test.com", null))))
                .andExpect(status().isCreated());

        assertThat(businessRepository.count()).isEqualTo(before);
    }

    @Test
    void shouldAllowSameEmailInTwoTenants() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .header("X-Tenant-Slug", "cafe-a")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest("shared@test.com", null))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .header("X-Tenant-Slug", "gym-b")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest("shared@test.com", null))))
                .andExpect(status().isCreated());

        assertThat(userRepository.findByTenantIdAndEmail(cafeA.getId(), "shared@test.com")).isPresent();
        assertThat(userRepository.findByTenantIdAndEmail(gymB.getId(), "shared@test.com")).isPresent();
    }

    @Test
    void shouldRejectDuplicateEmailInSameTenant() throws Exception {
        RegisterRequest request = registerRequest("dup@test.com", null);

        mockMvc.perform(post("/api/auth/register")
                        .header("X-Tenant-Slug", "cafe-a")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .header("X-Tenant-Slug", "cafe-a")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void shouldLoginTenantUserWithSlug() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .header("X-Tenant-Slug", "cafe-a")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest("login@test.com", null))))
                .andExpect(status().isCreated());

        LoginRequest login = new LoginRequest();
        login.setEmail("login@test.com");
        login.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .header("X-Tenant-Slug", "cafe-a")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantSlug").value("cafe-a"));
    }

    @Test
    void shouldNotLoginTenantUserWithoutSlug() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .header("X-Tenant-Slug", "cafe-a")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest("noslug@test.com", null))))
                .andExpect(status().isCreated());

        LoginRequest login = new LoginRequest();
        login.setEmail("noslug@test.com");
        login.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldLoginPlatformAdminWithoutSlug() throws Exception {
        userRepository.save(User.builder()
                .email("platform@test.com")
                .password(passwordEncoder.encode("platform123"))
                .firstName("Platform").lastName("Admin")
                .role(User.Role.PLATFORM_ADMIN)
                .qrCode("PLATFORMQR")
                .build());

        LoginRequest login = new LoginRequest();
        login.setEmail("platform@test.com");
        login.setPassword("platform123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("PLATFORM_ADMIN"))
                .andExpect(jsonPath("$.tenantId").doesNotExist());
    }

    @Test
    void shouldRejectLoginAgainstSuspendedTenant() throws Exception {
        cafeA.setStatus(Business.Status.SUSPENDED);
        businessRepository.save(cafeA);

        LoginRequest login = new LoginRequest();
        login.setEmail("x@test.com");
        login.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .header("X-Tenant-Slug", "cafe-a")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isForbidden());
    }

    private RegisterRequest registerRequest(String email, String role) {
        RegisterRequest request = new RegisterRequest();
        request.setEmail(email);
        request.setPassword("password123");
        request.setFirstName("Test");
        request.setLastName("User");
        request.setRole(role);
        return request;
    }
}
