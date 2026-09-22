package com.bharath.repairticket.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Device Entity
 * 
 * Represents a hardware device (Laptop, Phone, Tablet, etc.) brought in for repair.
 * Maps to the "devices" table in PostgreSQL.
 */
@Entity
@Table(name = "devices")
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "brand", nullable = false, length = 100)
    private String brand;

    @Column(name = "model", nullable = false, length = 100)
    private String model;

    @Column(name = "serial_number", nullable = false, unique = true, length = 100)
    private String serialNumber;

    @Column(name = "device_type", nullable = false, length = 50)
    private String deviceType;

    // N Devices -> 1 Customer
    // OWNING SIDE: holds 'customer_id' foreign key column in PostgreSQL
    // FetchType.LAZY: Customer is only loaded from DB when explicitly accessed
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    // 1 Device -> N RepairTickets
    // mappedBy = "device": RepairTicket owns the foreign key
    @OneToMany(mappedBy = "device", cascade = CascadeType.ALL)
    private List<RepairTicket> repairTickets = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Device() {
    }

    public Device(String brand, String model, String serialNumber, String deviceType, Customer customer) {
        this.brand = brand;
        this.model = model;
        this.serialNumber = serialNumber;
        this.deviceType = deviceType;
        this.customer = customer;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
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

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getDeviceType() {
        return deviceType;
    }

    public void setDeviceType(String deviceType) {
        this.deviceType = deviceType;
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

    public List<RepairTicket> getRepairTickets() {
        return repairTickets;
    }

    public void setRepairTickets(List<RepairTicket> repairTickets) {
        this.repairTickets = repairTickets;
    }

    // Bidirectional helper methods
    public void addRepairTicket(RepairTicket ticket) {
        repairTickets.add(ticket);
        ticket.setDevice(this);
    }

    public void removeRepairTicket(RepairTicket ticket) {
        repairTickets.remove(ticket);
        ticket.setDevice(null);
    }
}
