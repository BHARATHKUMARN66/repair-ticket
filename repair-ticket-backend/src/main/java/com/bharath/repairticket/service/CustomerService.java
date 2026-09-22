package com.bharath.repairticket.service;

import com.bharath.repairticket.dto.customer.CustomerRequest;
import com.bharath.repairticket.dto.customer.CustomerResponse;

import java.util.List;

/**
 * CustomerService Interface
 * 
 * Defines business operations available for Customer management.
 */
public interface CustomerService {

    CustomerResponse createCustomer(CustomerRequest request);

    CustomerResponse getCustomerById(Long id);

    CustomerResponse getCustomerByEmail(String email);

    List<CustomerResponse> getAllCustomers();

    CustomerResponse updateCustomer(Long id, CustomerRequest request);

    void deleteCustomer(Long id);
}
