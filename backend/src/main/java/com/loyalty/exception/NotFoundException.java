package com.loyalty.exception;

import org.springframework.http.HttpStatus;

/** Resource missing OR owned by another tenant. Both map to 404 to avoid leaking existence. */
public class NotFoundException extends ApiException {

    public NotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, "not_found", message);
    }

    public NotFoundException() {
        this("Resource not found");
    }
}
