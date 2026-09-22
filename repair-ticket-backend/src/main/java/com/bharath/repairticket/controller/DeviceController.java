package com.bharath.repairticket.controller;

import com.bharath.repairticket.dto.device.DeviceRequest;
import com.bharath.repairticket.dto.device.DeviceResponse;
import com.bharath.repairticket.service.DeviceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * DeviceController
 * 
 * REST API entry point for customer hardware device operations with Role-Based Access Control (RBAC).
 */
@RestController
@RequestMapping("/api/devices")
public class DeviceController {

    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    /**
     * Register a new device for a customer
     * POST /api/devices -> 201 Created
     * Allowed: ADMIN, USER
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<DeviceResponse> createDevice(@Valid @RequestBody DeviceRequest request) {
        DeviceResponse created = deviceService.createDevice(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Get device by ID
     * GET /api/devices/{id} -> 200 OK
     * Allowed: ADMIN, TECHNICIAN, USER
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'USER')")
    public ResponseEntity<DeviceResponse> getDeviceById(@PathVariable Long id) {
        DeviceResponse device = deviceService.getDeviceById(id);
        return ResponseEntity.ok(device);
    }

    /**
     * Get all devices in the system
     * GET /api/devices -> 200 OK
     * Allowed: ADMIN, TECHNICIAN
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<DeviceResponse>> getAllDevices() {
        List<DeviceResponse> devices = deviceService.getAllDevices();
        return ResponseEntity.ok(devices);
    }

    /**
     * Get all devices owned by a specific customer
     * GET /api/devices/customer/{customerId} -> 200 OK
     * Allowed: ADMIN, TECHNICIAN, USER
     */
    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'USER')")
    public ResponseEntity<List<DeviceResponse>> getDevicesByCustomerId(@PathVariable Long customerId) {
        List<DeviceResponse> devices = deviceService.getDevicesByCustomerId(customerId);
        return ResponseEntity.ok(devices);
    }

    /**
     * Update an existing device
     * PUT /api/devices/{id} -> 200 OK
     * Allowed: ADMIN, USER
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<DeviceResponse> updateDevice(
            @PathVariable Long id, 
            @Valid @RequestBody DeviceRequest request) {
        DeviceResponse updated = deviceService.updateDevice(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete a device by ID
     * DELETE /api/devices/{id} -> 204 No Content
     * Allowed: Strictly ADMIN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDevice(@PathVariable Long id) {
        deviceService.deleteDevice(id);
        return ResponseEntity.noContent().build();
    }
}

