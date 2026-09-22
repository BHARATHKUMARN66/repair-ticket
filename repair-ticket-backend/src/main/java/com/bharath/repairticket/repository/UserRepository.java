package com.bharath.repairticket.repository;

import com.bharath.repairticket.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * UserRepository
 * 
 * Data access abstraction for User credentials and authorization roles.
 * Used during Spring Security authentication in UserDetailsService.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by username for authentication and JWT generation.
     * Generates: "SELECT u FROM User u WHERE u.username = :username"
     */
    Optional<User> findByUsername(String username);

    /**
     * Check if username is already registered.
     */
    boolean existsByUsername(String username);
}
