package com.loyalty.exception;

import org.springframework.http.HttpStatus;

public class TenantSuspendedException extends ApiException {

    public TenantSuspendedException() {
        super(HttpStatus.FORBIDDEN, "tenant_suspended", "This business is not active");
    }
}
