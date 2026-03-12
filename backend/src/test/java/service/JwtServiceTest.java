package service;

import com.loyalty.entity.User;
import com.loyalty.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey",
            "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);

        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("encoded")
                .firstName("John")
                .lastName("Doe")
                .role(User.Role.CUSTOMER)
                .qrCode("ABC123")
                .build();
    }

    @Test
    void shouldGenerateToken() {
        String token = jwtService.generateToken(testUser);
        assertThat(token).isNotBlank();
    }

    @Test
    void shouldExtractUsernameFromToken() {
        String token = jwtService.generateToken(testUser);
        String extracted = jwtService.extractUsername(token);
        assertThat(extracted).isEqualTo("test@example.com");
    }

    @Test
    void shouldValidateToken() {
        String token = jwtService.generateToken(testUser);
        boolean valid = jwtService.isTokenValid(token, testUser);
        assertThat(valid).isTrue();
    }

    @Test
    void shouldRejectTokenForDifferentUser() {
        String token = jwtService.generateToken(testUser);

        User otherUser = User.builder()
                .email("other@example.com")
                .password("encoded")
                .firstName("Jane")
                .lastName("Doe")
                .role(User.Role.CUSTOMER)
                .qrCode("XYZ789")
                .build();

        boolean valid = jwtService.isTokenValid(token, otherUser);
        assertThat(valid).isFalse();
    }
}
