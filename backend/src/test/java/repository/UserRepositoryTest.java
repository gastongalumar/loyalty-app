package com.loyalty.repository;

import com.loyalty.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@EntityScan("com.loyalty.entity")
@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private User customer1;
    private User customer2;
    private User owner;

    @BeforeEach
    void setUp() {
        // Ensure users table exists in the embedded H2 database before saving
        String ddl = "CREATE TABLE IF NOT EXISTS users (\n" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY,\n" +
                "email VARCHAR(255) NOT NULL UNIQUE,\n" +
                "password VARCHAR(255) NOT NULL,\n" +
                "first_name VARCHAR(100) NOT NULL,\n" +
                "last_name VARCHAR(100) NOT NULL,\n" +
                "phone VARCHAR(30),\n" +
                "role VARCHAR(50) NOT NULL,\n" +
                "qr_code VARCHAR(64) NOT NULL UNIQUE,\n" +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n" +
                ")";
        jdbcTemplate.execute(ddl);

        // rely on Hibernate ddl-auto=create-drop for a clean schema; no explicit deleteAll()

        customer1 = User.builder()
                .email("alice@test.com")
                .password("encoded")
                .firstName("Alice")
                .lastName("Smith")
                .role(User.Role.CUSTOMER)
                .qrCode("QR001")
                .build();

        customer2 = User.builder()
                .email("bob@test.com")
                .password("encoded")
                .firstName("Bob")
                .lastName("Johnson")
                .role(User.Role.CUSTOMER)
                .qrCode("QR002")
                .build();

        owner = User.builder()
                .email("owner@test.com")
                .password("encoded")
                .firstName("Owner")
                .lastName("Person")
                .role(User.Role.BUSINESS_OWNER)
                .qrCode("QR003")
                .build();

        userRepository.saveAll(List.of(customer1, customer2, owner));
    }

    @Test
    void shouldFindByEmail() {
        Optional<User> found = userRepository.findByEmail("alice@test.com");
        assertThat(found).isPresent();
        assertThat(found.get().getFirstName()).isEqualTo("Alice");
    }

    @Test
    void shouldReturnEmptyForUnknownEmail() {
        Optional<User> found = userRepository.findByEmail("unknown@test.com");
        assertThat(found).isEmpty();
    }

    @Test
    void shouldFindByQrCode() {
        Optional<User> found = userRepository.findByQrCode("QR001");
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("alice@test.com");
    }

    @Test
    void shouldDetectExistingEmail() {
        assertThat(userRepository.existsByEmail("alice@test.com")).isTrue();
        assertThat(userRepository.existsByEmail("nobody@test.com")).isFalse();
    }

    @Test
    void shouldFindAllCustomersOnly() {
        List<User> customers = userRepository.findAllCustomers();
        assertThat(customers).hasSize(2);
        assertThat(customers).allMatch(u -> u.getRole() == User.Role.CUSTOMER);
    }

    @Test
    void shouldSearchByFirstName() {
        List<User> results = userRepository.searchCustomers("alice");
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getEmail()).isEqualTo("alice@test.com");
    }

    @Test
    void shouldSearchByLastName() {
        List<User> results = userRepository.searchCustomers("johnson");
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getFirstName()).isEqualTo("Bob");
    }

    @Test
    void shouldSearchByEmail() {
        List<User> results = userRepository.searchCustomers("bob@test");
        assertThat(results).hasSize(1);
    }

    @Test
    void shouldNotReturnOwnerInCustomerSearch() {
        List<User> results = userRepository.searchCustomers("owner");
        assertThat(results).isEmpty(); // BUSINESS_OWNER is excluded
    }
}
