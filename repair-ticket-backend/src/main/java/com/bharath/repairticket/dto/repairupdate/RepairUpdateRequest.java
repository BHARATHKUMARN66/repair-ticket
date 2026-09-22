package com.bharath.repairticket.dto.repairupdate;

import com.bharath.repairticket.entity.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * RepairUpdateRequest
 * 
 * Inbound payload when adding a diagnostic update or status change to a ticket.
 */
public class RepairUpdateRequest {

    @NotBlank(message = "Notes / diagnostic description is required")
    @Size(min = 5, max = 5000, message = "Diagnostic notes must be between 5 and 5000 characters")
    private String notes;

    private TicketStatus newStatus;

    @Positive(message = "Technician ID must be a positive integer")
    private Long technicianId;

    public RepairUpdateRequest() {
    }

    public RepairUpdateRequest(String notes, TicketStatus newStatus, Long technicianId) {
        this.notes = notes;
        this.newStatus = newStatus;
        this.technicianId = technicianId;
    }

    // Getters and Setters
    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public TicketStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(TicketStatus newStatus) {
        this.newStatus = newStatus;
    }

    public Long getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(Long technicianId) {
        this.technicianId = technicianId;
    }
}
