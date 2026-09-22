package com.bharath.repairticket.service;

import com.bharath.repairticket.dto.device.DeviceRequest;
import com.bharath.repairticket.dto.device.DeviceResponse;

import java.util.List;

/**
 * DeviceService Interface
 * 
 * Declares business capabilities for managing customer hardware devices.
 */
public interface DeviceService {

    DeviceResponse createDevice(DeviceRequest request);

    DeviceResponse getDeviceById(Long id);

    List<DeviceResponse> getAllDevices();

    List<DeviceResponse> getDevicesByCustomerId(Long customerId);

    DeviceResponse updateDevice(Long id, DeviceRequest request);

    void deleteDevice(Long id);
}
