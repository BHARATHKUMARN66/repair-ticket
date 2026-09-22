package com.bharath.repairticket.controller;

import com.bharath.repairticket.dto.technician.TechnicianRequest;
import com.bharath.repairticket.dto.technician.TechnicianResponse;
import com.bharath.repairticket.service.TechnicianService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * TechnicianController
 * 
 * REST API entry point for managing repair technicians with Role-Based Access Control (RBAC).
 */
@RestController
@RequestMapping("/api/technicians")
public class TechnicianController {

    private final TechnicianService technicianService;

    public TechnicianController(TechnicianService technicianService) {
        this.technicianService = technicianService;
    }

    /**
     * Onboard a new technician
     * POST /api/technicians -> 201 Created
     * Allowed: Strictly ADMIN
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<TechnicianResponse> createTechnician(@Valid @RequestBody TechnicianRequest request) {
        TechnicianResponse created = technicianService.createTechnician(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Get technician by ID
     * GET /api/technicians/{id} -> 200 OK
     * Allowed: ADMIN, TECHNICIAN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<TechnicianResponse> getTechnicianById(@PathVariable Long id) {
        TechnicianResponse technician = technicianService.getTechnicianById(id);
        return ResponseEntity.ok(technician);
    }

    /**
     * Get all technicians
     * GET /api/technicians -> 200 OK
     * Allowed: ADMIN, TECHNICIAN
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<TechnicianResponse>> getAllTechnicians() {
        List<TechnicianResponse> technicians = technicianService.getAllTechnicians();
        return ResponseEntity.ok(technicians);
    }

    /**
     * Get all currently active technicians
     * GET /api/technicians/active -> 200 OK
     * Allowed: ADMIN, TECHNICIAN
     */
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<TechnicianResponse>> getActiveTechnicians() {
        List<TechnicianResponse> activeTechnicians = technicianService.getActiveTechnicians();
        return ResponseEntity.ok(activeTechnicians);
    }

    /**
     * Filter technicians by specialization keyword
     * GET /api/technicians/specialization?query=screen -> 200 OK
     * Allowed: ADMIN, TECHNICIAN
     */
    @GetMapping("/specialization")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<TechnicianResponse>> getTechniciansBySpecialization(@RequestParam String query) {
        List<TechnicianResponse> technicians = technicianService.getTechniciansBySpecialization(query);
        return ResponseEntity.ok(technicians);
    }

    /**
     * Update technician profile
     * PUT /api/technicians/{id} -> 200 OK
     * Allowed: Strictly ADMIN
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TechnicianResponse> updateTechnician(
            @PathVariable Long id, 
            @Valid @RequestBody TechnicianRequest request) {
        TechnicianResponse updated = technicianService.updateTechnician(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Toggle technician active/inactive availability
     * PATCH /api/technicians/{id}/status -> 200 OK
     * Allowed: Strictly ADMIN
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TechnicianResponse> toggleTechnicianStatus(@PathVariable Long id) {
        TechnicianResponse updated = technicianService.toggleTechnicianStatus(id);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete technician
     * DELETE /api/technicians/{id} -> 204 No Content
     * Allowed: Strictly ADMIN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTechnician(@PathVariable Long id) {
        technicianService.deleteTechnician(id);
        return ResponseEntity.noContent().build();
    }
}

