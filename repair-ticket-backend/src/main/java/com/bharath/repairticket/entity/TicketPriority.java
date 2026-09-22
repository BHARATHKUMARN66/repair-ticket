package com.bharath.repairticket.entity;

/**
 * Priority levels for repair tickets.
 * 
 * In PostgreSQL, this is stored as VARCHAR text (e.g. 'LOW', 'MEDIUM', 'HIGH', 'URGENT')
 * because we use @Enumerated(EnumType.STRING).
 */
public enum TicketPriority {
    LOW,
    MEDIUM,
    HIGH,
    URGENT
}
