package com.bharath.repairticket.dto.device;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * DeviceRequest
 * 
 * Inbound payload when registering a new device for a customer.
 */
public class DeviceRequest {

    @NotBlank(message = "Brand is required")
    @Size(min = 1, max = 100, message = "Brand cannot exceed 100 characters")
    private String brand;

    @NotBlank(message = "Model is required")
    @Size(min = 1, max = 100, message = "Model cannot exceed 100 characters")
    private String model;

    @NotBlank(message = "Serial number is required")
    @Size(min = 3, max = 100, message = "Serial number must be between 3 and 100 characters")
    @Pattern(regexp = "^[A-Za-z0-9-_]+$", message = "Serial number can only contain alphanumeric characters, hyphens, and underscores")
    private String serialNumber;

    @NotBlank(message = "Device type is required (e.g., LAPTOP, SMARTPHONE, TABLET, DESKTOP)")
    @Size(max = 50, message = "Device type cannot exceed 50 characters")
    private String deviceType;

    @NotNull(message = "Customer ID is required")
    @Positive(message = "Customer ID must be a positive integer")
    private Long customerId;

    public DeviceRequest() {
    }

    public DeviceRequest(String brand, String model, String serialNumber, String deviceType, Long customerId) {
        this.brand = brand;
        this.model = model;
        this.serialNumber = serialNumber;
        this.deviceType = deviceType;
        this.customerId = customerId;
    }

    // Getters and Setters
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

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }
}
