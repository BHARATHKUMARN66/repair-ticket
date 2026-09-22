package com.bharath.repairticket.entity;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

/**
 * Status stages of the Repair Ticket workflow:
 * 
 * OPEN -> ASSIGNED -> IN_PROGRESS -> REPAIR_COMPLETED -> CLOSED
 * (CANCELLED can be transitioned from OPEN, ASSIGNED, or IN_PROGRESS)
 * 
 * Enforced in PostgreSQL as VARCHAR text via @Enumerated(EnumType.STRING).
 * Contains a Finite State Machine (FSM) defining legal workflow progressions.
 */
public enum TicketStatus {
    OPEN,
    ASSIGNED,
    IN_PROGRESS,
    REPAIR_COMPLETED,
    CLOSED,
    CANCELLED;

    /**
     * Returns the set of valid next statuses reachable from the current status.
     */
    public Set<TicketStatus> getAllowedNextStatuses() {
        return switch (this) {
            case OPEN -> EnumSet.of(ASSIGNED, CANCELLED);
            case ASSIGNED -> EnumSet.of(IN_PROGRESS, OPEN, CANCELLED);
            case IN_PROGRESS -> EnumSet.of(REPAIR_COMPLETED, ASSIGNED, CANCELLED);
            case REPAIR_COMPLETED -> EnumSet.of(CLOSED, IN_PROGRESS);
            case CLOSED, CANCELLED -> Collections.emptySet(); // Terminal states
        };
    }

    /**
     * Validates if transitioning from 'this' status to 'target' status is permitted.
     */
    public boolean canTransitionTo(TicketStatus target) {
        if (this == target) {
            return true; // No-op transition (staying in same state) is permitted
        }
        return getAllowedNextStatuses().contains(target);
    }
}
