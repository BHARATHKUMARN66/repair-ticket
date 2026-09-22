package com.bharath.repairticket.dto.ticket;

import com.bharath.repairticket.entity.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * RepairTicketRequest
 * 
 * Inbound payload for creating a new repair ticket.
 * Requires description, priority, customer ID, and device ID.
 */
public class RepairTicketRequest {

    @NotBlank(message = "Issue description is required")
    @Size(min = 10, max = 5000, message = "Issue description must be between 10 and 5000 characters")
    private String issueDescription;

    @NotNull(message = "Priority is required (LOW, MEDIUM, HIGH, URGENT)")
    private TicketPriority priority;

    @NotNull(message = "Customer ID is required")
    @Positive(message = "Customer ID must be a positive integer")
    private Long customerId;

    @NotNull(message = "Device ID is required")
    @Positive(message = "Device ID must be a positive integer")
    private Long deviceId;

    public RepairTicketRequest() {
    }

    public RepairTicketRequest(String issueDescription, TicketPriority priority, Long customerId, Long deviceId) {
        this.issueDescription = issueDescription;
        this.priority = priority;
        this.customerId = customerId;
        this.deviceId = deviceId;
    }

    // Getters and Setters
    public String getIssueDescription() {
        return issueDescription;
    }

    public void setIssueDescription(String issueDescription) {
        this.issueDescription = issueDescription;
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

    public Long getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(Long deviceId) {
        this.deviceId = deviceId;
    }
}
