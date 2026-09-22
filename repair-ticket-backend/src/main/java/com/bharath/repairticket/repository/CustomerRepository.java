package com.bharath.repairticket.repository;

import com.bharath.repairticket.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * CustomerRepository
 * 
 * Data access abstraction for Customer entity.
 * Spring Data JPA creates a dynamic runtime proxy implementing this interface.
 */
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    /**
     * Derived query method: Spring Data JPA parses the method name
     * and generates: "SELECT c FROM Customer c WHERE c.email = :email"
     */
    Optional<Customer> findByEmail(String email);

    /**
     * Efficient existence check:
     * Generates: "SELECT count(c) > 0 FROM Customer c WHERE c.email = :email"
     */
    boolean existsByEmail(String email);

    /**
     * Case-insensitive partial name search:
     */
    List<Customer> findByLastNameContainingIgnoreCaseOrFirstNameContainingIgnoreCase(String lastName, String firstName);
}
