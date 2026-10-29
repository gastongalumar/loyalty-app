package com.loyalty.tenant;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class HeaderTenantResolver implements TenantResolver {

    public static final String HEADER = "X-Tenant-Slug";

    @Override
    public Optional<String> resolveSlug(HttpServletRequest request) {
        String value = request.getHeader(HEADER);
        if (value == null || value.isBlank()) {
            return Optional.empty();
        }
        return Optional.of(value.trim().toLowerCase());
    }
}
