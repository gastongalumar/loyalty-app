package com.loyalty.exception;

import org.springframework.http.HttpStatus;

public class InvalidRequestException extends ApiException {

    public InvalidRequestException(String message) {
        super(HttpStatus.BAD_REQUEST, "invalid_request", message);
    }

    public InvalidRequestException(String code, String message) {
        super(HttpStatus.BAD_REQUEST, code, message);
    }
}
