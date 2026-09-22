package com.bharath.repairticket.dto.repairupdate;

import com.bharath.repairticket.entity.TicketStatus;

import java.time.LocalDateTime;

/**
 * RepairUpdateResponse
 * 
 * Outbound payload presenting an audit log / update record.
 */
public class RepairUpdateResponse {

    private Long id;
    private Long ticketId;
    private String ticketNumber;
    private String notes;
    private TicketStatus previousStatus;
    private TicketStatus newStatus;
    private Long technicianId;
    private String technicianName;
    private LocalDateTime createdAt;

    public RepairUpdateResponse() {
    }

    public RepairUpdateResponse(Long id, Long ticketId, String ticketNumber, String notes, 
                                TicketStatus previousStatus, TicketStatus newStatus, 
                                Long technicianId, String technicianName, LocalDateTime createdAt) {
        this.id = id;
        this.ticketId = ticketId;
        this.ticketNumber = ticketNumber;
        this.notes = notes;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.technicianId = technicianId;
        this.technicianName = technicianName;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public String getTicketNumber() {
        return ticketNumber;
    }

    public void setTicketNumber(String ticketNumber) {
        this.ticketNumber = ticketNumber;
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

    public Long getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(Long technicianId) {
        this.technicianId = technicianId;
    }

    public String getTechnicianName() {
        return technicianName;
    }

    public void setTechnicianName(String technicianName) {
        this.technicianName = technicianName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
