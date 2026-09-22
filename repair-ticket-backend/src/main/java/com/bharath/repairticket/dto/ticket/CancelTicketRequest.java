package com.bharath.repairticket.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * CancelTicketRequest
 * 
 * Inbound payload when a customer or admin cancels an active repair ticket.
 * Requires an auditable description explaining the reason for cancellation.
 */
public class CancelTicketRequest {

    @NotBlank(message = "Cancellation description is required")
    @Size(min = 5, max = 1000, message = "Cancellation description must be between 5 and 1000 characters")
    private String reason;

    public CancelTicketRequest() {
    }

    public CancelTicketRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
