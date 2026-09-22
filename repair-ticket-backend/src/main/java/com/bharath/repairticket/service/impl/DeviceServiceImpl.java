package com.bharath.repairticket.service.impl;

import com.bharath.repairticket.dto.device.DeviceRequest;
import com.bharath.repairticket.dto.device.DeviceResponse;
import com.bharath.repairticket.entity.Customer;
import com.bharath.repairticket.entity.Device;
import com.bharath.repairticket.exception.DuplicateResourceException;
import com.bharath.repairticket.exception.ResourceNotFoundException;
import com.bharath.repairticket.repository.CustomerRepository;
import com.bharath.repairticket.repository.DeviceRepository;
import com.bharath.repairticket.service.DeviceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * DeviceServiceImpl
 * 
 * Implements business operations for hardware devices.
 * Enforces serial number uniqueness, validates customer associations,
 * and manages transactional boundaries.
 */
@Service
public class DeviceServiceImpl implements DeviceService {

    private final DeviceRepository deviceRepository;
    private final CustomerRepository customerRepository;

    // Constructor Injection for loose coupling and testability
    public DeviceServiceImpl(DeviceRepository deviceRepository, CustomerRepository customerRepository) {
        this.deviceRepository = deviceRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    @Transactional
    public DeviceResponse createDevice(DeviceRequest request) {
        // Business Rule 1: Referenced customer must exist in database
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        // Business Rule 2: Device serial number must be globally unique
        if (deviceRepository.existsBySerialNumber(request.getSerialNumber())) {
            throw new DuplicateResourceException("Device with serial number '" + request.getSerialNumber() + "' already exists");
        }

        // Instantiate entity with relationship to owning Customer
        Device device = new Device(
                request.getBrand(),
                request.getModel(),
                request.getSerialNumber(),
                request.getDeviceType(),
                customer
        );

        Device savedDevice = deviceRepository.save(device);

        return mapToResponse(savedDevice);
    }

    @Override
    @Transactional(readOnly = true)
    public DeviceResponse getDeviceById(Long id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + id));

        return mapToResponse(device);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeviceResponse> getAllDevices() {
        return deviceRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeviceResponse> getDevicesByCustomerId(Long customerId) {
        // Ensure customer exists before querying devices
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }

        return deviceRepository.findByCustomerId(customerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DeviceResponse updateDevice(Long id, DeviceRequest request) {
        Device existing = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + id));

        // If serial number changed, verify it's not taken by another device
        if (!existing.getSerialNumber().equalsIgnoreCase(request.getSerialNumber())
                && deviceRepository.existsBySerialNumber(request.getSerialNumber())) {
            throw new DuplicateResourceException("Device with serial number '" + request.getSerialNumber() + "' already exists");
        }

        // If customer changed, verify new customer exists
        if (!existing.getCustomer().getId().equals(request.getCustomerId())) {
            Customer newCustomer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));
            existing.setCustomer(newCustomer);
        }

        existing.setBrand(request.getBrand());
        existing.setModel(request.getModel());
        existing.setSerialNumber(request.getSerialNumber());
        existing.setDeviceType(request.getDeviceType());

        Device updatedDevice = deviceRepository.save(existing);

        return mapToResponse(updatedDevice);
    }

    @Override
    @Transactional
    public void deleteDevice(Long id) {
        if (!deviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Device not found with id: " + id);
        }
        deviceRepository.deleteById(id);
    }

    // Mapping helper from JPA Entity to Response DTO
    private DeviceResponse mapToResponse(Device device) {
        Customer customer = device.getCustomer();
        String customerFullName = (customer != null) 
                ? customer.getFirstName() + " " + customer.getLastName() 
                : "Unknown";

        Long customerId = (customer != null) ? customer.getId() : null;

        return new DeviceResponse(
                device.getId(),
                device.getBrand(),
                device.getModel(),
                device.getSerialNumber(),
                device.getDeviceType(),
                customerId,
                customerFullName,
                device.getCreatedAt(),
                device.getUpdatedAt()
        );
    }
}
