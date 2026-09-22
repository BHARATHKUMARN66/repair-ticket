package com.bharath.repairticket.dto.ticket;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * AssignTechnicianRequest
 * 
 * Inbound payload when assigning or reassigning a ticket to a technician.
 */
public class AssignTechnicianRequest {

    @NotNull(message = "Technician ID is required")
    @Positive(message = "Technician ID must be a positive integer")
    private Long technicianId;

    @Size(max = 500, message = "Assignment notes cannot exceed 500 characters")
    private String assignmentNotes;

    public AssignTechnicianRequest() {
    }

    public AssignTechnicianRequest(Long technicianId, String assignmentNotes) {
        this.technicianId = technicianId;
        this.assignmentNotes = assignmentNotes;
    }

    // Getters and Setters
    public Long getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(Long technicianId) {
        this.technicianId = technicianId;
    }

    public String getAssignmentNotes() {
        return assignmentNotes;
    }

    public void setAssignmentNotes(String assignmentNotes) {
        this.assignmentNotes = assignmentNotes;
    }
}
