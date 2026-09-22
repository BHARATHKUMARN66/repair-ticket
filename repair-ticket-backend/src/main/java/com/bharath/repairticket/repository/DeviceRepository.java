package com.bharath.repairticket.repository;

import com.bharath.repairticket.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * DeviceRepository
 * 
 * Data access abstraction for Device entity.
 */
@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {

    /**
     * Find a device by its unique serial number.
     */
    Optional<Device> findBySerialNumber(String serialNumber);

    /**
     * Check if a device with the given serial number already exists.
     */
    boolean existsBySerialNumber(String serialNumber);

    /**
     * Traverses relationship: finds all devices owned by a given customer ID.
     * Generates: "SELECT d FROM Device d WHERE d.customer.id = :customerId"
     */
    List<Device> findByCustomerId(Long customerId);
}
