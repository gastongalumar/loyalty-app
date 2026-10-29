package com.loyalty.exception;

import org.springframework.http.HttpStatus;

public class TenantMismatchException extends ApiException {

    public TenantMismatchException() {
        super(HttpStatus.FORBIDDEN, "tenant_mismatch", "Tenant header does not match the authenticated tenant");
    }
}
