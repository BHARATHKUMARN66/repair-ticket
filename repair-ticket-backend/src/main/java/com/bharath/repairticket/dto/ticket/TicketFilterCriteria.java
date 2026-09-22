package com.bharath.repairticket.dto.ticket;

import com.bharath.repairticket.entity.TicketPriority;
import com.bharath.repairticket.entity.TicketStatus;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

/**
 * TicketFilterCriteria
 * 
 * Binds incoming HTTP query parameters for search, multi-criteria filtering,
 * and date range lookups.
 */
public class TicketFilterCriteria {

    private String search;
    private TicketStatus status;
    private TicketPriority priority;
    private Long customerId;
    private Long technicianId;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;

    public TicketFilterCriteria() {
    }

    public TicketFilterCriteria(String search, TicketStatus status, TicketPriority priority, 
                                Long customerId, Long technicianId, LocalDate startDate, LocalDate endDate) {
        this.search = search;
        this.status = status;
        this.priority = priority;
        this.customerId = customerId;
        this.technicianId = technicianId;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // Getters and Setters
    public String getSearch() {
        return search;
    }

    public void setSearch(String search) {
        this.search = search;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(Long technicianId) {
        this.technicianId = technicianId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
}
