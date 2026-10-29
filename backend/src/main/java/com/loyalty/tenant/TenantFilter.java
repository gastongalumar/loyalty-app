package com.loyalty.tenant;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.loyalty.entity.Business;
import com.loyalty.exception.ApiException;
import com.loyalty.exception.TenantMismatchException;
import com.loyalty.exception.TenantSuspendedException;
import com.loyalty.repository.BusinessRepository;
import com.loyalty.security.SecurityUser;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

/**
 * Single place where the request tenant is decided:
 * - authenticated requests: from the signed JWT principal (never from body/URL);
 * - public requests: from the tenant resolver (X-Tenant-Slug in R1).
 *
 * Also blocks requests against suspended/deleted businesses and mismatched slugs.
 * Context is always cleared in a finally block.
 */
@Component
public class TenantFilter extends OncePerRequestFilter {

    private final TenantResolver tenantResolver;
    private final BusinessRepository businessRepository;
    private final ObjectMapper objectMapper;

    public TenantFilter(TenantResolver tenantResolver,
                        BusinessRepository businessRepository,
                        ObjectMapper objectMapper) {
        this.tenantResolver = tenantResolver;
        this.businessRepository = businessRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication != null && authentication.getPrincipal() instanceof SecurityUser principal) {
                applyAuthenticatedTenant(request, principal);
            } else {
                applyPublicTenant(request);
            }

            filterChain.doFilter(request, response);
        } catch (ApiException ex) {
            writeError(response, ex);
        } finally {
            TenantContext.clear();
        }
    }

    private void applyAuthenticatedTenant(HttpServletRequest request, SecurityUser principal) {
        if (principal.isPlatformAdmin()) {
            TenantContext.clear();
            return;
        }

        TenantContext.set(new TenantRef(principal.getTenantId(), principal.getTenantSlug()));

        Optional<String> headerSlug = tenantResolver.resolveSlug(request);
        if (headerSlug.isPresent() && !headerSlug.get().equals(principal.getTenantSlug())) {
            throw new TenantMismatchException();
        }

        Business business = businessRepository.findById(principal.getTenantId())
                .orElseThrow(TenantSuspendedException::new);
        if (business.getStatus() != Business.Status.ACTIVE) {
            throw new TenantSuspendedException();
        }
    }

    private void applyPublicTenant(HttpServletRequest request) {
        Optional<String> slug = tenantResolver.resolveSlug(request);
        if (slug.isEmpty()) {
            return;
        }

        Optional<Business> business = businessRepository.findBySlug(slug.get());
        if (business.isEmpty()) {
            return;
        }

        if (business.get().getStatus() != Business.Status.ACTIVE) {
            if (request.getRequestURI().startsWith("/api/auth/")) {
                throw new TenantSuspendedException();
            }
            return;
        }

        TenantContext.set(new TenantRef(business.get().getId(), business.get().getSlug()));
    }

    private void writeError(HttpServletResponse response, ApiException ex) throws IOException {
        if (response.isCommitted()) {
            return;
        }
        response.setStatus(ex.getStatus().value());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), Map.of(
                "code", ex.getCode(),
                "message", ex.getMessage()
        ));
    }
}
