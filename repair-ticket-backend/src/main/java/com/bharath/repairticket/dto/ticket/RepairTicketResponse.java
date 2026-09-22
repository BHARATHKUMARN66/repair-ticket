package com.bharath.repairticket.dto.ticket;

import com.bharath.repairticket.entity.TicketPriority;
import com.bharath.repairticket.entity.TicketStatus;

import java.time.LocalDateTime;

/**
 * RepairTicketResponse
 * 
 * Outbound comprehensive ticket payload containing summarized customer,
 * device, and technician information without leaking JPA entity graphs or causing recursion.
 */
public class RepairTicketResponse {

    private Long id;
    private String ticketNumber;
    private String issueDescription;
    private TicketPriority priority;
    private TicketStatus status;

    // Flattened Customer summary
    private Long customerId;
    private String customerName;
    private String customerEmail;

    // Flattened Device summary
    private Long deviceId;
    private String deviceBrand;
    private String deviceModel;
    private String deviceSerialNumber;

    // Flattened Technician summary (nullable)
    private Long assignedTechnicianId;
    private String assignedTechnicianName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RepairTicketResponse() {
    }

    public RepairTicketResponse(Long id, String ticketNumber, String issueDescription, 
                                TicketPriority priority, TicketStatus status, 
                                Long customerId, String customerName, String customerEmail, 
                                Long deviceId, String deviceBrand, String deviceModel, String deviceSerialNumber, 
                                Long assignedTechnicianId, String assignedTechnicianName, 
                                LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.ticketNumber = ticketNumber;
        this.issueDescription = issueDescription;
        this.priority = priority;
        this.status = status;
        this.customerId = customerId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.deviceId = deviceId;
        this.deviceBrand = deviceBrand;
        this.deviceModel = deviceModel;
        this.deviceSerialNumber = deviceSerialNumber;
        this.assignedTechnicianId = assignedTechnicianId;
        this.assignedTechnicianName = assignedTechnicianName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTicketNumber() {
        return ticketNumber;
    }

    public void setTicketNumber(String ticketNumber) {
        this.ticketNumber = ticketNumber;
    }

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

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public Long getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(Long deviceId) {
        this.deviceId = deviceId;
    }

    public String getDeviceBrand() {
        return deviceBrand;
    }

    public void setDeviceBrand(String deviceBrand) {
        this.deviceBrand = deviceBrand;
    }

    public String getDeviceModel() {
        return deviceModel;
    }

    public void setDeviceModel(String deviceModel) {
        this.deviceModel = deviceModel;
    }

    public String getDeviceSerialNumber() {
        return deviceSerialNumber;
    }

    public void setDeviceSerialNumber(String deviceSerialNumber) {
        this.deviceSerialNumber = deviceSerialNumber;
    }

    public Long getAssignedTechnicianId() {
        return assignedTechnicianId;
    }

    public void setAssignedTechnicianId(Long assignedTechnicianId) {
        this.assignedTechnicianId = assignedTechnicianId;
    }

    public String getAssignedTechnicianName() {
        return assignedTechnicianName;
    }

    public void setAssignedTechnicianName(String assignedTechnicianName) {
        this.assignedTechnicianName = assignedTechnicianName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
