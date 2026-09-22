package com.bharath.repairticket.service.impl;

import com.bharath.repairticket.dto.auth.AuthResponse;
import com.bharath.repairticket.dto.auth.LoginRequest;
import com.bharath.repairticket.dto.auth.RegisterRequest;
import com.bharath.repairticket.entity.Role;
import com.bharath.repairticket.entity.User;
import com.bharath.repairticket.exception.DuplicateResourceException;
import com.bharath.repairticket.repository.UserRepository;
import com.bharath.repairticket.security.JwtTokenProvider;
import com.bharath.repairticket.service.AuthService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AuthServiceImpl
 * 
 * Implements user account registration with BCrypt salted password hashing,
 * credential validation, and JWT token issuance.
 */
@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthServiceImpl(UserRepository userRepository, 
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }


    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String trimmedUsername = request.getUsername().trim();

        // 1. Enforce unique username constraint
        if (userRepository.existsByUsername(trimmedUsername)) {
            throw new DuplicateResourceException("Username '" + trimmedUsername + "' is already registered");
        }

        // 2. Security Enforcement: Public self-registration is strictly restricted to ROLE_USER (Customers).
        // Staff, technician, and administrator accounts must be provisioned by a Facility Administrator.
        if (request.getRole() != null && request.getRole() != Role.ROLE_USER) {
            throw new BadCredentialsException("Public self-registration is only permitted for client accounts. Specialist and staff accounts must be provisioned by a Facility Administrator.");
        }
        Role assignedRole = Role.ROLE_USER;

        // 3. Cryptographic salt & hash using BCrypt work factor 10
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // 4. Instantiate and persist user
        User user = new User(
                trimmedUsername,
                hashedPassword,
                request.getFullName().trim(),
                assignedRole
        );

        User savedUser = userRepository.save(user);

        // 5. Generate signed JWT token
        String token = jwtTokenProvider.generateToken(savedUser.getUsername(), savedUser.getRole().name());

        return new AuthResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getFullName(),
                savedUser.getRole(),
                token,
                "Bearer",
                "User registered successfully"
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String trimmedUsername = request.getUsername().trim();

        // 1. Locate user account by username
        User user = userRepository.findByUsername(trimmedUsername)
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        // 2. Validate plaintext password against stored BCrypt hash
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        // 3. Check if account has been disabled
        if (!user.isEnabled()) {
            throw new DisabledException("User account is disabled. Please contact an administrator.");
        }

        // 4. Generate signed JWT token
        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole().name());

        return new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getRole(),
                token,
                "Bearer",
                "Authentication successful"
        );
    }

}
