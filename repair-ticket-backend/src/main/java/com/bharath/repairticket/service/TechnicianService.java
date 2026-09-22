package com.bharath.repairticket.service;

import com.bharath.repairticket.dto.technician.TechnicianRequest;
import com.bharath.repairticket.dto.technician.TechnicianResponse;

import java.util.List;

/**
 * TechnicianService Interface
 * 
 * Defines business operations for managing repair technicians,
 * including profile management, availability status, and specialization lookups.
 */
public interface TechnicianService {

    TechnicianResponse createTechnician(TechnicianRequest request);

    TechnicianResponse getTechnicianById(Long id);

    List<TechnicianResponse> getAllTechnicians();

    List<TechnicianResponse> getActiveTechnicians();

    List<TechnicianResponse> getTechniciansBySpecialization(String specialization);

    TechnicianResponse updateTechnician(Long id, TechnicianRequest request);

    TechnicianResponse toggleTechnicianStatus(Long id);

    void deleteTechnician(Long id);
}
