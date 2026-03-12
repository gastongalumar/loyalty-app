package com.loyalty.dto;

import java.time.LocalDateTime;

public class UserManagementDto {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String role;
    private LocalDateTime createdAt;

    public UserManagementDto() {}

    // Getters & Setters
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; } public void setEmail(String email) { this.email = email; }
    public String getFirstName() { return firstName; } public void setFirstName(String v) { this.firstName = v; }
    public String getLastName() { return lastName; } public void setLastName(String v) { this.lastName = v; }
    public String getPhone() { return phone; } public void setPhone(String phone) { this.phone = phone; }
    public String getRole() { return role; } public void setRole(String role) { this.role = role; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }

    // DTO for admin creating a user
    public static class CreateRequest {
        private String email;
        private String password;
        private String firstName;
        private String lastName;
        private String phone;
        private String role; // CUSTOMER or BUSINESS_OWNER

        public String getEmail() { return email; } public void setEmail(String v) { this.email = v; }
        public String getPassword() { return password; } public void setPassword(String v) { this.password = v; }
        public String getFirstName() { return firstName; } public void setFirstName(String v) { this.firstName = v; }
        public String getLastName() { return lastName; } public void setLastName(String v) { this.lastName = v; }
        public String getPhone() { return phone; } public void setPhone(String v) { this.phone = v; }
        public String getRole() { return role; } public void setRole(String v) { this.role = v; }
    }

    // DTO for role update
    public static class UpdateRoleRequest {
        private String role;
        public String getRole() { return role; } public void setRole(String v) { this.role = v; }
    }
}
