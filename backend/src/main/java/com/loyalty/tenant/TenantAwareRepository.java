package com.loyalty.tenant;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.List;
import java.util.Optional;

/**
 * Base repository for tenant-scoped resources.
 *
 * <p>Every finder exposed here requires a {@code tenantId}. The point is that a service cannot
 * fetch a tenant resource by id alone: the compiler forces the tenant to be supplied, and that
 * tenant always comes from {@link TenantContext}, never from the request body or path.</p>
 */
@NoRepositoryBean
public interface TenantAwareRepository<T extends TenantOwned, ID> extends JpaRepository<T, ID> {

    Optional<T> findByIdAndTenantId(ID id, Long tenantId);

    List<T> findAllByTenantId(Long tenantId);

    Page<T> findAllByTenantId(Long tenantId, Pageable pageable);

    long countByTenantId(Long tenantId);
}
