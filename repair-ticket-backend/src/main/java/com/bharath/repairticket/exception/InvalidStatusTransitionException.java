package com.bharath.repairticket.exception;

import com.bharath.repairticket.entity.TicketStatus;

/**
 * Thrown when an illegal ticket status transition is attempted
 * (e.g., trying to move from CLOSED back to OPEN).
 * Maps conceptually to HTTP 400 BAD_REQUEST or HTTP 409 CONFLICT.
 */
public class InvalidStatusTransitionException extends RuntimeException {

    public InvalidStatusTransitionException(TicketStatus from, TicketStatus to) {
        super(String.format("Invalid ticket status transition from '%s' to '%s'. Allowed transitions: %s",
                from, to, from.getAllowedNextStatuses()));
    }

    public InvalidStatusTransitionException(String message) {
        super(message);
    }
}
