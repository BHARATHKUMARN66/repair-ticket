package com.bharath.repairticket.dto.auth;

import com.bharath.repairticket.entity.Role;

/**
 * AuthResponse
 * 
 * Response payload returned upon successful registration or authentication.
 * Prepares the contract for JWT bearer tokens (Phase 18).
 */
public class AuthResponse {

    private Long id;
    private String username;
    private String fullName;
    private Role role;
    private String token;
    private String tokenType = "Bearer";
    private String message;

    public AuthResponse() {
    }

    public AuthResponse(Long id, String username, String fullName, Role role, String token, String tokenType, String message) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.token = token;
        this.tokenType = tokenType != null ? tokenType : "Bearer";
        this.message = message;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
