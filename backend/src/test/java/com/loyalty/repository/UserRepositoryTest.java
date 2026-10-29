package com.loyalty.repository;

import com.loyalty.entity.Business;
import com.loyalty.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired private UserRepository userRepository;
    @Autowired private BusinessRepository businessRepository;

    private Business cafeA;
    private Business gymB;

    @BeforeEach
    void setUp() {
        cafeA = businessRepository.save(Business.builder()
                .name("Cafe A").slug("cafe-a").stampsRequired(10)
                .rewardDescription("Free coffee").status(Business.Status.ACTIVE).build());
        gymB = businessRepository.save(Business.builder()
                .name("Gym B").slug("gym-b").stampsRequired(8)
                .rewardDescription("Free month").status(Business.Status.ACTIVE).build());

        userRepository.save(User.builder()
                .tenant(cafeA).email("alice@test.com").password("encoded")
                .firstName("Alice").lastName("Smith")
                .role(User.Role.CUSTOMER).qrCode("QR001").build());
        userRepository.save(User.builder()
                .tenant(cafeA).email("bob@test.com").password("encoded")
                .firstName("Bob").lastName("Johnson")
                .role(User.Role.CUSTOMER).qrCode("QR002").build());
        userRepository.save(User.builder()
                .tenant(gymB).email("alice@test.com").password("encoded")
                .firstName("Alice").lastName("Gym")
                .role(User.Role.CUSTOMER).qrCode("QR003").build());
        userRepository.save(User.builder()
                .tenant(cafeA).email("owner@test.com").password("encoded")
                .firstName("Owner").lastName("Person")
                .role(User.Role.BUSINESS_ADMIN).qrCode("QR004").build());
    }

    @Test
    void shouldFindByTenantAndEmail() {
        Optional<User> found = userRepository.findByTenantIdAndEmail(cafeA.getId(), "alice@test.com");
        assertThat(found).isPresent();
        assertThat(found.get().getLastName()).isEqualTo("Smith");
    }

    @Test
    void shouldNotFindUserFromAnotherTenant() {
        assertThat(userRepository.findByTenantIdAndEmail(gymB.getId(), "bob@test.com")).isEmpty();
    }

    @Test
    void shouldScopeCustomerListToTenant() {
        var page = userRepository.findByTenantIdAndRole(cafeA.getId(), User.Role.CUSTOMER, PageRequest.of(0, 20));
        assertThat(page.getTotalElements()).isEqualTo(2);
    }

    @Test
    void shouldScopeSearchToTenant() {
        var page = userRepository.searchByTenant(gymB.getId(), User.Role.CUSTOMER, "alice", PageRequest.of(0, 20));
        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getContent().get(0).getLastName()).isEqualTo("Gym");
    }

    @Test
    void shouldFindQrOnlyInsideTenant() {
        assertThat(userRepository.findByQrCodeAndTenantId("QR001", cafeA.getId())).isPresent();
        assertThat(userRepository.findByQrCodeAndTenantId("QR001", gymB.getId())).isEmpty();
    }

    @Test
    void shouldNotReturnPlatformAdminInTenantSearch() {
        userRepository.save(User.builder()
                .email("platform@test.com").password("encoded")
                .firstName("Platform").lastName("Admin")
                .role(User.Role.PLATFORM_ADMIN).qrCode("QRPLATFORM").build());

        var page = userRepository.searchByTenant(cafeA.getId(), User.Role.CUSTOMER, "platform", PageRequest.of(0, 20));
        assertThat(page.getContent()).isEmpty();
    }
}
