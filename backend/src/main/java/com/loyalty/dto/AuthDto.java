package com.loyalty.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDto {

    public static class RegisterRequest {
        @NotBlank @Email
        private String email;

        @NotBlank @Size(min = 6)
        private String password;

        @NotBlank
        private String firstName;

        @NotBlank
        private String lastName;

        private String phone;

        @NotBlank
        private String role; // CUSTOMER or BUSINESS_OWNER

        public String getEmail(){return email;} public void setEmail(String email){this.email=email;}
        public String getPassword(){return password;} public void setPassword(String password){this.password=password;}
        public String getFirstName(){return firstName;} public void setFirstName(String firstName){this.firstName=firstName;}
        public String getLastName(){return lastName;} public void setLastName(String lastName){this.lastName=lastName;}
        public String getPhone(){return phone;} public void setPhone(String phone){this.phone=phone;}
        public String getRole(){return role;} public void setRole(String role){this.role=role;}
    }

    public static class LoginRequest {
        @NotBlank @Email
        private String email;

        @NotBlank
        private String password;

        public String getEmail(){return email;} public void setEmail(String email){this.email=email;}
        public String getPassword(){return password;} public void setPassword(String password){this.password=password;}
    }

    public static class AuthResponse {
        private String token;
        private String email;
        private String firstName;
        private String lastName;
        private String role;
        private Long userId;

        public AuthResponse(String token, String email, String firstName,
                            String lastName, String role, Long userId) {
            this.token = token;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.role = role;
            this.userId = userId;
        }

        public String getToken(){return token;} public void setToken(String token){this.token=token;}
        public String getEmail(){return email;} public void setEmail(String email){this.email=email;}
        public String getFirstName(){return firstName;} public void setFirstName(String firstName){this.firstName=firstName;}
        public String getLastName(){return lastName;} public void setLastName(String lastName){this.lastName=lastName;}
        public String getRole(){return role;} public void setRole(String role){this.role=role;}
        public Long getUserId(){return userId;} public void setUserId(Long userId){this.userId=userId;}
    }
}
