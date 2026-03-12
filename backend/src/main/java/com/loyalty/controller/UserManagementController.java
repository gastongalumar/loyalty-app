package com.loyalty.controller;

import com.loyalty.dto.UserManagementDto;
import com.loyalty.entity.User;
import com.loyalty.service.UserManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class UserManagementController {

    private final UserManagementService userManagementService;

    public UserManagementController(UserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    // GET /api/admin/users — list all users
    @GetMapping
    public ResponseEntity<List<UserManagementDto>> getAllUsers() {
        return ResponseEntity.ok(userManagementService.getAllUsers());
    }

    // POST /api/admin/users — create user with any role
    @PostMapping
    public ResponseEntity<UserManagementDto> createUser(
            @RequestBody UserManagementDto.CreateRequest request) {
        return ResponseEntity.ok(userManagementService.createUser(request));
    }

    // PATCH /api/admin/users/{id}/role — change role of existing user
    @PatchMapping("/{id}/role")
    public ResponseEntity<UserManagementDto> updateRole(
            @PathVariable Long id,
            @RequestBody UserManagementDto.UpdateRoleRequest request) {
        return ResponseEntity.ok(userManagementService.updateUserRole(id, request.getRole()));
    }

    // DELETE /api/admin/users/{id} — delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal User admin) {
        userManagementService.deleteUser(id, admin);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}
