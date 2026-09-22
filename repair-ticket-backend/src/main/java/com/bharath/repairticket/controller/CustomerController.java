package com.bharath.repairticket.controller;

import com.bharath.repairticket.dto.customer.CustomerRequest;
import com.bharath.repairticket.dto.customer.CustomerResponse;
import com.bharath.repairticket.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CustomerController
 * 
 * REST API entry point for Customer management with Role-Based Access Control (RBAC).
 */
@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    /**
     * Create a new customer
     * POST /api/customers -> 201 Created
     * Allowed: ADMIN, USER
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<CustomerResponse> createCustomer(@Valid @RequestBody CustomerRequest request) {
        CustomerResponse created = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Get a customer by ID
     * GET /api/customers/{id} -> 200 OK
     * Allowed: ADMIN, TECHNICIAN, USER
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'USER')")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable Long id) {
        CustomerResponse customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(customer);
    }

    /**
     * Get a customer by email
     * GET /api/customers/by-email?email={email} -> 200 OK
     * Allowed: ADMIN, TECHNICIAN, USER
     */
    @GetMapping("/by-email")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN', 'USER')")
    public ResponseEntity<CustomerResponse> getCustomerByEmail(@RequestParam String email) {
        CustomerResponse customer = customerService.getCustomerByEmail(email);
        return ResponseEntity.ok(customer);
    }

    /**
     * Get all customers
     * GET /api/customers -> 200 OK
     * Allowed: ADMIN, TECHNICIAN
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<CustomerResponse>> getAllCustomers() {
        List<CustomerResponse> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }

    /**
     * Update an existing customer
     * PUT /api/customers/{id} -> 200 OK
     * Allowed: ADMIN, USER
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @PathVariable Long id, 
            @Valid @RequestBody CustomerRequest request) {
        CustomerResponse updated = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete a customer by ID
     * DELETE /api/customers/{id} -> 204 No Content
     * Allowed: Strictly ADMIN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }
}

