package com.loyalty.tenant;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Optional;

/**
 * Resolves the tenant of a public request.
 *
 * <p>R1 uses {@link HeaderTenantResolver} (the Angular app turns the {@code /:slug} path segment
 * into {@code X-Tenant-Slug}). Moving to subdomains later means adding a
 * {@code SubdomainTenantResolver} implementation; no service or controller changes.</p>
 */
public interface TenantResolver {
    Optional<String> resolveSlug(HttpServletRequest request);
}
