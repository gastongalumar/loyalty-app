package com.loyalty.tenant;

import com.loyalty.exception.NotFoundException;

import java.util.Optional;

/**
 * Defense in depth: even when a repository already filters by tenant, services pass the
 * result through here so a cross-tenant lookup always becomes a 404 (never 403, which
 * would confirm the resource exists).
 */
public final class TenantGuard {

    private TenantGuard() {
    }

    public static <T> T require(Optional<T> resource) {
        return resource.orElseThrow(NotFoundException::new);
    }

    public static <T> T require(Optional<T> resource, String message) {
        return resource.orElseThrow(() -> new NotFoundException(message));
    }
}
