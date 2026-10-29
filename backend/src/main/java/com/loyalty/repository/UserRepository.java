package com.loyalty.repository;

import com.loyalty.entity.User;
import com.loyalty.tenant.TenantAwareRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends TenantAwareRepository<User, Long> {

    @EntityGraph(attributePaths = "tenant")
    Optional<User> findByTenantIdAndEmail(Long tenantId, String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.tenant WHERE u.id = :id")
    Optional<User> findWithTenantById(@Param("id") Long id);

    Optional<User> findByIdAndTenantId(Long id, Long tenantId);

    Optional<User> findByQrCodeAndTenantId(String qrCode, Long tenantId);

    boolean existsByTenantIdAndEmail(Long tenantId, String email);

    Optional<User> findByEmailAndTenantIsNull(String email);

    Optional<User> findByEmailAndRole(String email, User.Role role);

    long countByTenantIdAndRole(Long tenantId, User.Role role);

    @Query("""
            SELECT u FROM User u
            WHERE u.tenantId = :tenantId AND u.role = :role
              AND (LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%'))
                OR LOWER(u.lastName)  LIKE LOWER(CONCAT('%', :query, '%'))
                OR LOWER(u.email)     LIKE LOWER(CONCAT('%', :query, '%')))
            """)
    Page<User> searchByTenant(@Param("tenantId") Long tenantId,
                              @Param("role") User.Role role,
                              @Param("query") String query,
                              Pageable pageable);

    Page<User> findByTenantIdAndRole(Long tenantId, User.Role role, Pageable pageable);
}
