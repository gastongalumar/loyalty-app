package com.loyalty.tenant;

/** Marker for entities that carry a {@code tenant_id} column. */
public interface TenantOwned {
    Long getTenantId();
}
