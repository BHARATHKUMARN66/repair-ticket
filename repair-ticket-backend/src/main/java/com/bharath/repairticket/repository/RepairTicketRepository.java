package com.bharath.repairticket.repository;

import com.bharath.repairticket.entity.RepairTicket;
import com.bharath.repairticket.entity.TicketPriority;
import com.bharath.repairticket.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * RepairTicketRepository
 * 
 * Central repository for ticket management.
 * Extends JpaSpecificationExecutor to support dynamic criteria queries, filtering, and sorting.
 */
@Repository
public interface RepairTicketRepository extends JpaRepository<RepairTicket, Long>, JpaSpecificationExecutor<RepairTicket> {

    Optional<RepairTicket> findByTicketNumber(String ticketNumber);

    boolean existsByTicketNumber(String ticketNumber);

    List<RepairTicket> findByStatus(TicketStatus status);

    List<RepairTicket> findByPriority(TicketPriority priority);

    List<RepairTicket> findByCustomerId(Long customerId);

    List<RepairTicket> findByAssignedTechnicianId(Long technicianId);

    /**
     * Find tickets that are awaiting technician assignment.
     * Generates: "SELECT t FROM RepairTicket t WHERE t.assignedTechnician IS NULL"
     */
    List<RepairTicket> findByAssignedTechnicianIsNull();

    /**
     * Explicit JPQL Query with JOIN FETCH.
     * 
     * Overrides LAZY fetching for a single query to fetch the ticket, customer,
     * device, and assigned technician in a SINGLE SQL SELECT with INNER/LEFT JOINs.
     * Prevents the N+1 query problem completely.
     */
    @Query("SELECT t FROM RepairTicket t " +
           "JOIN FETCH t.customer " +
           "JOIN FETCH t.device " +
           "LEFT JOIN FETCH t.assignedTechnician " +
           "WHERE t.id = :id")
    Optional<RepairTicket> findByIdWithDetails(@Param("id") Long id);
}
