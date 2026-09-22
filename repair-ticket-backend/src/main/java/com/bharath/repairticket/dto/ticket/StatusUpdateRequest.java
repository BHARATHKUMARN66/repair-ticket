package com.bharath.repairticket.dto.ticket;

import com.bharath.repairticket.entity.TicketStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * StatusUpdateRequest
 * 
 * Inbound payload when transitioning a ticket's lifecycle status.
 */
public class StatusUpdateRequest {

    @NotNull(message = "New status is required (OPEN, ASSIGNED, IN_PROGRESS, REPAIR_COMPLETED, CLOSED, CANCELLED)")
    private TicketStatus newStatus;

    @Size(max = 1000, message = "Status notes cannot exceed 1000 characters")
    private String notes;

    @Positive(message = "Technician ID must be a positive integer")
    private Long technicianId;

    public StatusUpdateRequest() {
    }

    public StatusUpdateRequest(TicketStatus newStatus, String notes, Long technicianId) {
        this.newStatus = newStatus;
        this.notes = notes;
        this.technicianId = technicianId;
    }

    // Getters and Setters
    public TicketStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(TicketStatus newStatus) {
        this.newStatus = newStatus;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Long getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(Long technicianId) {
        this.technicianId = technicianId;
    }
}
