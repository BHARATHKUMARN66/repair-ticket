package com.bharath.repairticket.service.impl;

import com.bharath.repairticket.dto.customer.CustomerRequest;
import com.bharath.repairticket.dto.customer.CustomerResponse;
import com.bharath.repairticket.entity.Customer;
import com.bharath.repairticket.exception.DuplicateResourceException;
import com.bharath.repairticket.exception.ResourceNotFoundException;
import com.bharath.repairticket.repository.CustomerRepository;
import com.bharath.repairticket.service.CustomerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * CustomerServiceImpl
 * 
 * Implements business operations for Customer entities.
 * Manages transaction boundaries, DTO mapping, and business rule validations.
 */
@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    // Constructor Injection (preferred over @Autowired field injection)
    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        // Business Rule: Email must be unique
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Customer with email '" + request.getEmail() + "' already exists");
        }

        // Map DTO to Entity
        Customer customer = mapToEntity(request);

        // Save entity to PostgreSQL via Hibernate
        Customer savedCustomer = customerRepository.save(customer);

        // Map saved entity to Response DTO
        return mapToResponse(savedCustomer);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        return mapToResponse(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerByEmail(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + email));

        return mapToResponse(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer existing = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        // If email changed, verify new email is not taken by someone else
        if (!existing.getEmail().equalsIgnoreCase(request.getEmail()) 
                && customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Customer with email '" + request.getEmail() + "' already exists");
        }

        // Update entity state
        existing.setFirstName(request.getFirstName());
        existing.setLastName(request.getLastName());
        existing.setEmail(request.getEmail());
        existing.setPhoneNumber(request.getPhoneNumber());
        existing.setAddress(request.getAddress());

        // Hibernate Dirty Checking automatically updates on commit, but save() is explicit
        Customer updatedCustomer = customerRepository.save(existing);

        return mapToResponse(updatedCustomer);
    }

    @Override
    @Transactional
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer not found with id: " + id);
        }
        customerRepository.deleteById(id);
    }

    // Explicit Mapping Helpers
    private Customer mapToEntity(CustomerRequest request) {
        return new Customer(
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getPhoneNumber(),
                request.getAddress()
        );
    }

    private CustomerResponse mapToResponse(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getEmail(),
                customer.getPhoneNumber(),
                customer.getAddress(),
                customer.getCreatedAt(),
                customer.getUpdatedAt()
        );
    }
}
