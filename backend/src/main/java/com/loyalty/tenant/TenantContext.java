package com.loyalty.tenant;

import com.loyalty.exception.MissingTenantContextException;

/**
 * Request-scoped tenant holder. Populated from the signed JWT (authenticated requests)
 * or from the tenant resolver (public register/login). Never from body or query params.
 */
public final class TenantContext {

    private static final ThreadLocal<TenantRef> CURRENT = new ThreadLocal<>();

    private TenantContext() {
    }

    public static void set(TenantRef tenant) {
        CURRENT.set(tenant);
    }

    public static TenantRef get() {
        return CURRENT.get();
    }

    public static boolean hasTenant() {
        return CURRENT.get() != null && CURRENT.get().id() != null;
    }

    public static Long requireTenantId() {
        TenantRef ref = CURRENT.get();
        if (ref == null || ref.id() == null) {
            throw new MissingTenantContextException();
        }
        return ref.id();
    }

    public static String requireSlug() {
        TenantRef ref = CURRENT.get();
        if (ref == null || ref.slug() == null) {
            throw new MissingTenantContextException();
        }
        return ref.slug();
    }

    public static void clear() {
        CURRENT.remove();
    }
}
