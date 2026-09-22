package com.bharath.repairticket.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Customer Entity
 * 
 * Represents a customer who owns devices and requests repair tickets.
 * Maps to the "customers" table in PostgreSQL.
 */
@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "phone_number", nullable = false, length = 30)
    private String phoneNumber;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 1 Customer -> N Devices
    // mappedBy = "customer": specifies that Device entity owns the foreign key
    // cascade = CascadeType.ALL: saving/updating/deleting Customer cascades to owned Devices
    // orphanRemoval = true: removing a Device from this list deletes it from database
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Device> devices = new ArrayList<>();

    // 1 Customer -> N RepairTickets
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private List<RepairTicket> repairTickets = new ArrayList<>();

    // Hibernate requires a no-argument constructor for reflection/proxying
    public Customer() {
    }

    public Customer(String firstName, String lastName, String email, String phoneNumber, String address) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.address = address;
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

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
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

    public List<Device> getDevices() {
        return devices;
    }

    public void setDevices(List<Device> devices) {
        this.devices = devices;
    }

    public List<RepairTicket> getRepairTickets() {
        return repairTickets;
    }

    public void setRepairTickets(List<RepairTicket> repairTickets) {
        this.repairTickets = repairTickets;
    }

    // Bidirectional Helper Methods: Keep both sides of the relationship in sync in memory
    public void addDevice(Device device) {
        devices.add(device);
        device.setCustomer(this);
    }

    public void removeDevice(Device device) {
        devices.remove(device);
        device.setCustomer(null);
    }

    public void addRepairTicket(RepairTicket ticket) {
        repairTickets.add(ticket);
        ticket.setCustomer(this);
    }

    public void removeRepairTicket(RepairTicket ticket) {
        repairTickets.remove(ticket);
        ticket.setCustomer(null);
    }
}
