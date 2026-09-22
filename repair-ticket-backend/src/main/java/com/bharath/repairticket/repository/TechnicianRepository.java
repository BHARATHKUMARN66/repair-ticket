package com.bharath.repairticket.repository;

import com.bharath.repairticket.entity.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * TechnicianRepository
 * 
 * Data access abstraction for Technician entity.
 */
@Repository
public interface TechnicianRepository extends JpaRepository<Technician, Long> {

    Optional<Technician> findByEmail(String email);

    boolean existsByEmail(String email);

    /**
     * Find only technicians who are currently active and available for ticket assignments.
     * Generates: "SELECT t FROM Technician t WHERE t.active = true"
     */
    List<Technician> findByActiveTrue();

    /**
     * Find technicians matching a specialization keyword (e.g. "Screen", "Micro-soldering").
     */
    List<Technician> findBySpecializationContainingIgnoreCase(String specialization);
}
