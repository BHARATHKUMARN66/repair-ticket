package com.bharath.repairticket.controller;

import com.bharath.repairticket.dto.common.PagedResponse;
import com.bharath.repairticket.dto.ticket.AssignTechnicianRequest;
import com.bharath.repairticket.dto.ticket.CancelTicketRequest;
import com.bharath.repairticket.dto.ticket.RepairTicketRequest;
import com.bharath.repairticket.dto.ticket.RepairTicketResponse;
import com.bharath.repairticket.dto.ticket.StatusUpdateRequest;
import com.bharath.repairticket.dto.ticket.TicketFilterCriteria;
import com.bharath.repairticket.entity.TicketPriority;
import com.bharath.repairticket.entity.TicketStatus;
import com.bharath.repairticket.service.RepairTicketService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * RepairTicketController
 * 
 * REST API entry point for ticket creation, status transitions, technician assignments, and lookups
 * with Role-Based Access Control (RBAC).
 */
@RestController
@RequestMapping("/api/tickets")
public class RepairTicketController {

    private final RepairTicketService repairTicketService;

    public RepairTicketController(RepairTicketService repairTicketService) {
        this.repairTicketService = repairTicketService;
    }

    /**
     * Create a new repair ticket
     * POST /api/tickets -> 201 Created
     * Allowed: ADMIN, USER
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<RepairTicketResponse> createTicket(@Valid @RequestBody RepairTicketRequest request) {
        RepairTicketResponse created = repairTicketService.createTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Get ticket by ID (uses JOIN FETCH for complete details)
     * GET /api/tickets/{id} -> 200 OK
     * Allowed: ADMIN, TECHNICIAN, USER
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'USER')")
    public ResponseEntity<RepairTicketResponse> getTicketById(@PathVariable Long id) {
        RepairTicketResponse ticket = repairTicketService.getTicketById(id);
        return ResponseEntity.ok(ticket);
    }

    /**
     * Look up ticket by public tracking ticket number
     * GET /api/tickets/number/{ticketNumber} -> 200 OK
     * Allowed: Public (Permit All)
     */
    @GetMapping("/number/{ticketNumber}")
    public ResponseEntity<RepairTicketResponse> getTicketByTicketNumber(@PathVariable String ticketNumber) {
        RepairTicketResponse ticket = repairTicketService.getTicketByTicketNumber(ticketNumber);
        return ResponseEntity.ok(ticket);
    }

    /**
     * Search and filter tickets with dynamic criteria, pagination, and sorting
     * GET /api/tickets?search=screen&status=OPEN&priority=HIGH&page=0&size=10&sort=createdAt,desc -> 200 OK
     * Allowed: ADMIN, TECHNICIAN, USER
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'USER')")
    public ResponseEntity<PagedResponse<RepairTicketResponse>> searchTickets(
            TicketFilterCriteria criteria,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PagedResponse<RepairTicketResponse> response = repairTicketService.searchTickets(criteria, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all tickets belonging to a customer
     * GET /api/tickets/customer/{customerId} -> 200 OK
     * Allowed: ADMIN, TECHNICIAN, USER
     */
    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'USER')")
    public ResponseEntity<List<RepairTicketResponse>> getTicketsByCustomerId(@PathVariable Long customerId) {
        List<RepairTicketResponse> tickets = repairTicketService.getTicketsByCustomerId(customerId);
        return ResponseEntity.ok(tickets);
    }

    /**
     * Filter tickets by lifecycle status
     * GET /api/tickets/status/{status} -> 200 OK
     * Allowed: ADMIN, TECHNICIAN
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<RepairTicketResponse>> getTicketsByStatus(@PathVariable TicketStatus status) {
        List<RepairTicketResponse> tickets = repairTicketService.getTicketsByStatus(status);
        return ResponseEntity.ok(tickets);
    }

    /**
     * Filter tickets by urgency priority
     * GET /api/tickets/priority/{priority} -> 200 OK
     * Allowed: ADMIN, TECHNICIAN
     */
    @GetMapping("/priority/{priority}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<RepairTicketResponse>> getTicketsByPriority(@PathVariable TicketPriority priority) {
        List<RepairTicketResponse> tickets = repairTicketService.getTicketsByPriority(priority);
        return ResponseEntity.ok(tickets);
    }

    /**
     * Get all tickets assigned to a technician
     * GET /api/tickets/technician/{technicianId} -> 200 OK
     * Allowed: ADMIN, TECHNICIAN
     */
    @GetMapping("/technician/{technicianId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<RepairTicketResponse>> getTicketsByTechnicianId(@PathVariable Long technicianId) {
        List<RepairTicketResponse> tickets = repairTicketService.getTicketsByTechnicianId(technicianId);
        return ResponseEntity.ok(tickets);
    }

    /**
     * Transition ticket status through the Finite State Machine
     * PATCH /api/tickets/{ticketId}/status -> 200 OK
     * Allowed: ADMIN, TECHNICIAN
     */
    @PatchMapping("/{ticketId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<RepairTicketResponse> updateTicketStatus(
            @PathVariable Long ticketId,
            @Valid @RequestBody StatusUpdateRequest request) {
        RepairTicketResponse updated = repairTicketService.updateTicketStatus(ticketId, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Cancel a repair ticket with a mandatory description/reason
     * POST /api/tickets/{ticketId}/cancel -> 200 OK
     * Allowed: ADMIN, USER (customer who raised the ticket)
     */
    @PostMapping("/{ticketId}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<RepairTicketResponse> cancelTicket(
            @PathVariable Long ticketId,
            @Valid @RequestBody CancelTicketRequest request,
            Principal principal) {
        String username = (principal != null) ? principal.getName() : null;
        RepairTicketResponse updated = repairTicketService.cancelTicket(ticketId, request, username);
        return ResponseEntity.ok(updated);
    }

    /**
     * Assign or reassign a technician to a ticket
     * POST /api/tickets/{ticketId}/assign -> 200 OK
     * Allowed: Strictly ADMIN
     */
    @PostMapping("/{ticketId}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<RepairTicketResponse> assignTechnician(
            @PathVariable Long ticketId,
            @Valid @RequestBody AssignTechnicianRequest request) {
        RepairTicketResponse updated = repairTicketService.assignTechnician(ticketId, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Unassign technician from ticket (reverts ASSIGNED status back to OPEN)
     * POST /api/tickets/{ticketId}/unassign -> 200 OK
     * Allowed: ADMIN, TECHNICIAN
     */
    @PostMapping("/{ticketId}/unassign")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<RepairTicketResponse> unassignTechnician(
            @PathVariable Long ticketId,
            @RequestParam(required = false) String notes) {
        RepairTicketResponse updated = repairTicketService.unassignTechnician(ticketId, notes);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete ticket by ID
     * DELETE /api/tickets/{id} -> 204 No Content
     * Allowed: Strictly ADMIN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        repairTicketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }
}

