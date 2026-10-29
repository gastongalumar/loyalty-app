package com.loyalty.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Public registration. There is no functional role field: the tenant is resolved from
 * X-Tenant-Slug and the role is always CUSTOMER. A non-CUSTOMER value is rejected in the
 * service (400) instead of silently ignored, so an attacker gets an explicit error.
 */
@Data
public class RegisterRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 100)
    private String password;

    @NotBlank
    @Size(max = 100)
    private String firstName;

    @NotBlank
    @Size(max = 100)
    private String lastName;

    @Size(max = 30)
    private String phone;

    /** Optional. Only "CUSTOMER" is accepted; anything else is a 400. */
    private String role;
}
