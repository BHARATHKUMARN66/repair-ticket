package com.bharath.repairticket.controller;

import com.bharath.repairticket.dto.repairupdate.RepairUpdateRequest;
import com.bharath.repairticket.dto.repairupdate.RepairUpdateResponse;
import com.bharath.repairticket.service.RepairUpdateService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * RepairUpdateController
 * 
 * REST API entry point for ticket progress notes, diagnostic logs,
 * and chronological repair histories with Role-Based Access Control (RBAC).
 */
@RestController
public class RepairUpdateController {

    private final RepairUpdateService repairUpdateService;

    public RepairUpdateController(RepairUpdateService repairUpdateService) {
        this.repairUpdateService = repairUpdateService;
    }

    /**
     * Add a progress note / diagnostic update to a repair ticket
     * POST /api/tickets/{ticketId}/updates -> 201 Created
     * Allowed: ADMIN, TECHNICIAN
     */
    @PostMapping("/api/tickets/{ticketId}/updates")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<RepairUpdateResponse> addUpdateToTicket(
            @PathVariable Long ticketId, 
            @Valid @RequestBody RepairUpdateRequest request) {
        RepairUpdateResponse created = repairUpdateService.addUpdateToTicket(ticketId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Get all chronological updates for a repair ticket (newest first)
     * GET /api/tickets/{ticketId}/updates -> 200 OK
     * Allowed: ADMIN, TECHNICIAN, USER
     */
    @GetMapping("/api/tickets/{ticketId}/updates")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'USER')")
    public ResponseEntity<List<RepairUpdateResponse>> getUpdatesByTicketId(@PathVariable Long ticketId) {
        List<RepairUpdateResponse> updates = repairUpdateService.getUpdatesByTicketId(ticketId);
        return ResponseEntity.ok(updates);
    }

    /**
     * Public tracker endpoint: Get all chronological updates for a repair ticket by ticket number
     * GET /api/tickets/number/{ticketNumber}/updates -> 200 OK
     * Publicly accessible for customer repair tracking
     */
    @GetMapping("/api/tickets/number/{ticketNumber}/updates")
    public ResponseEntity<List<RepairUpdateResponse>> getUpdatesByTicketNumber(@PathVariable String ticketNumber) {
        List<RepairUpdateResponse> updates = repairUpdateService.getUpdatesByTicketNumber(ticketNumber);
        return ResponseEntity.ok(updates);
    }

    /**
     * Get a specific update by its ID
     * GET /api/updates/{updateId} -> 200 OK
     * Allowed: ADMIN, TECHNICIAN, USER
     */
    @GetMapping("/api/updates/{updateId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'USER')")
    public ResponseEntity<RepairUpdateResponse> getUpdateById(@PathVariable Long updateId) {
        RepairUpdateResponse update = repairUpdateService.getUpdateById(updateId);
        return ResponseEntity.ok(update);
    }

    /**
     * Get all updates authored by a specific technician
     * GET /api/updates/technician/{technicianId} -> 200 OK
     * Allowed: ADMIN, TECHNICIAN
     */
    @GetMapping("/api/updates/technician/{technicianId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<RepairUpdateResponse>> getUpdatesByTechnicianId(@PathVariable Long technicianId) {
        List<RepairUpdateResponse> updates = repairUpdateService.getUpdatesByTechnicianId(technicianId);
        return ResponseEntity.ok(updates);
    }
}

