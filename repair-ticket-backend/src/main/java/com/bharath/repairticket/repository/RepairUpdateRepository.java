package com.bharath.repairticket.repository;

import com.bharath.repairticket.entity.RepairUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * RepairUpdateRepository
 * 
 * Data access abstraction for audit logs and progress notes.
 */
@Repository
public interface RepairUpdateRepository extends JpaRepository<RepairUpdate, Long> {

    /**
     * Retrieve all updates for a ticket in reverse chronological order (newest first).
     * Generates: "SELECT u FROM RepairUpdate u WHERE u.repairTicket.id = :repairTicketId ORDER BY u.createdAt DESC"
     */
    List<RepairUpdate> findByRepairTicketIdOrderByCreatedAtDesc(Long repairTicketId);

    /**
     * Retrieve all updates authored by a specific technician.
     */
    List<RepairUpdate> findByTechnicianId(Long technicianId);
}
