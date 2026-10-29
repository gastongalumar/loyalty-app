package com.loyalty.security;

import com.loyalty.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Authentication principal. Never expose the JPA entity: it would drag a lazy tenant
 * and password hash into the security context.
 */
public class SecurityUser implements UserDetails {

    private final Long id;
    private final String email;
    private final String password;
    private final User.Role role;
    private final Long tenantId;
    private final String tenantSlug;

    public SecurityUser(Long id, String email, String password, User.Role role,
                        Long tenantId, String tenantSlug) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.role = role;
        this.tenantId = tenantId;
        this.tenantSlug = tenantSlug;
    }

    public Long getId() {
        return id;
    }

    public User.Role getRole() {
        return role;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public String getTenantSlug() {
        return tenantSlug;
    }

    public boolean isPlatformAdmin() {
        return role == User.Role.PLATFORM_ADMIN;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
