package com.bharath.repairticket.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * RepairTicket Entity
 * 
 * The central entity of the system representing a customer's repair request.
 * Maps to the "repair_tickets" table in PostgreSQL.
 */
@Entity
@Table(name = "repair_tickets")
public class RepairTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_number", nullable = false, unique = true, length = 64)
    private String ticketNumber;

    @Column(name = "issue_description", nullable = false, columnDefinition = "TEXT")
    private String issueDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private TicketStatus status;

    // N RepairTickets -> 1 Customer
    // OWNING SIDE: holds 'customer_id' foreign key
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    // N RepairTickets -> 1 Device
    // OWNING SIDE: holds 'device_id' foreign key
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    // N RepairTickets -> 1 Technician (optional initially when status is OPEN)
    // OWNING SIDE: holds 'assigned_technician_id' foreign key (nullable)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_technician_id")
    private Technician assignedTechnician;

    // 1 RepairTicket -> N RepairUpdates
    // mappedBy = "repairTicket": RepairUpdate owns the foreign key
    // cascade = ALL, orphanRemoval = true: updates life cycle strictly tied to ticket
    @OneToMany(mappedBy = "repairTicket", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RepairUpdate> repairUpdates = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public RepairTicket() {
    }

    public RepairTicket(String ticketNumber, String issueDescription, TicketPriority priority, 
                        TicketStatus status, Customer customer, Device device) {
        this.ticketNumber = ticketNumber;
        this.issueDescription = issueDescription;
        this.priority = priority;
        this.status = status;
        this.customer = customer;
        this.device = device;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = TicketStatus.OPEN;
        }
        if (this.priority == null) {
            this.priority = TicketPriority.MEDIUM;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
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

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Device getDevice() {
        return device;
    }

    public void setDevice(Device device) {
        this.device = device;
    }

    public Technician getAssignedTechnician() {
        return assignedTechnician;
    }

    public void setAssignedTechnician(Technician assignedTechnician) {
        this.assignedTechnician = assignedTechnician;
    }

    public List<RepairUpdate> getRepairUpdates() {
        return repairUpdates;
    }

    public void setRepairUpdates(List<RepairUpdate> repairUpdates) {
        this.repairUpdates = repairUpdates;
    }

    // Bidirectional helper methods for RepairUpdate
    public void addRepairUpdate(RepairUpdate update) {
        repairUpdates.add(update);
        update.setRepairTicket(this);
    }

    public void removeRepairUpdate(RepairUpdate update) {
        repairUpdates.remove(update);
        update.setRepairTicket(null);
    }
}
