package com.loyalty.tenant;

/**
 * Minimal tenant identity carried through a request.
 * {@code id} is {@code businesses.id}; {@code slug} is the public path segment.
 */
public record TenantRef(Long id, String slug) {
}
