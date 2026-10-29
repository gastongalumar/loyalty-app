package com.loyalty.exception;

import org.springframework.http.HttpStatus;

public class MissingTenantContextException extends ApiException {

    public MissingTenantContextException() {
        super(HttpStatus.UNAUTHORIZED, "tenant_context_missing", "The request has no tenant context");
    }
}
