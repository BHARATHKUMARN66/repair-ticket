package com.bharath.repairticket.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * RepairUpdate Entity
 * 
 * Represents an audit log / progress note entry added during ticket lifecycle.
 * Maps to the "repair_updates" table in PostgreSQL.
 */
@Entity
@Table(name = "repair_updates")
public class RepairUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "notes", nullable = false, columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 30)
    private TicketStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", length = 30)
    private TicketStatus newStatus;

    // N RepairUpdates -> 1 RepairTicket
    // OWNING SIDE: holds 'repair_ticket_id' foreign key
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repair_ticket_id", nullable = false)
    private RepairTicket repairTicket;

    // N RepairUpdates -> 1 Technician (optional: technician who posted the update)
    // OWNING SIDE: holds 'technician_id' foreign key
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id")
    private Technician technician;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public RepairUpdate() {
    }

    public RepairUpdate(String notes, TicketStatus previousStatus, TicketStatus newStatus, 
                        RepairTicket repairTicket, Technician technician) {
        this.notes = notes;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.repairTicket = repairTicket;
        this.technician = technician;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public TicketStatus getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(TicketStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public TicketStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(TicketStatus newStatus) {
        this.newStatus = newStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public RepairTicket getRepairTicket() {
        return repairTicket;
    }

    public void setRepairTicket(RepairTicket repairTicket) {
        this.repairTicket = repairTicket;
    }

    public Technician getTechnician() {
        return technician;
    }

    public void setTechnician(Technician technician) {
        this.technician = technician;
    }
}
