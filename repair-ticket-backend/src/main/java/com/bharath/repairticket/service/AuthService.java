package com.bharath.repairticket.service;

import com.bharath.repairticket.dto.auth.AuthResponse;
import com.bharath.repairticket.dto.auth.LoginRequest;
import com.bharath.repairticket.dto.auth.RegisterRequest;

/**
 * AuthService Interface
 * 
 * Defines core authentication contracts: registration with salted BCrypt password hashing,
 * credential verification, and session token generation.
 */
public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
