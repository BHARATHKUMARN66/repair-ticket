package com.bharath.repairticket.service.impl;

import com.bharath.repairticket.dto.technician.TechnicianRequest;
import com.bharath.repairticket.dto.technician.TechnicianResponse;
import com.bharath.repairticket.entity.RepairTicket;
import com.bharath.repairticket.entity.RepairUpdate;
import com.bharath.repairticket.entity.Role;
import com.bharath.repairticket.entity.Technician;
import com.bharath.repairticket.entity.TicketStatus;
import com.bharath.repairticket.entity.User;
import com.bharath.repairticket.exception.DuplicateResourceException;
import com.bharath.repairticket.exception.ResourceNotFoundException;
import com.bharath.repairticket.repository.RepairTicketRepository;
import com.bharath.repairticket.repository.RepairUpdateRepository;
import com.bharath.repairticket.repository.TechnicianRepository;
import com.bharath.repairticket.repository.UserRepository;
import com.bharath.repairticket.service.TechnicianService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * TechnicianServiceImpl
 * 
 * Implements technician management logic, including email uniqueness validation,
 * availability toggling, and specialization queries.
 */
@Service
public class TechnicianServiceImpl implements TechnicianService {

    private final TechnicianRepository technicianRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RepairTicketRepository repairTicketRepository;
    private final RepairUpdateRepository repairUpdateRepository;

    public TechnicianServiceImpl(TechnicianRepository technicianRepository,
                                 UserRepository userRepository,
                                 PasswordEncoder passwordEncoder,
                                 RepairTicketRepository repairTicketRepository,
                                 RepairUpdateRepository repairUpdateRepository) {
        this.technicianRepository = technicianRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.repairTicketRepository = repairTicketRepository;
        this.repairUpdateRepository = repairUpdateRepository;
    }

    @Override
    @Transactional
    public TechnicianResponse createTechnician(TechnicianRequest request) {
        // Business Rule: Email must be unique in technicians
        if (technicianRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Technician with email '" + request.getEmail() + "' already exists");
        }

        // Determine portal login username
        String username = request.getUsername();
        if (username != null && !username.trim().isEmpty()) {
            username = username.trim().toLowerCase();
        } else {
            // Auto-generate username from email prefix
            username = request.getEmail().split("@")[0].toLowerCase().replaceAll("[^a-z0-9_]", "");
        }

        if (userRepository.existsByUsername(username)) {
            throw new DuplicateResourceException("User account with username '" + username + "' already exists");
        }

        // Determine initial portal password
        String password = request.getPassword();
        if (password == null || password.trim().isEmpty()) {
            password = "Tech@" + (request.getFirstName() != null ? request.getFirstName() : "2026") + "!";
        }

        // 1. Provision User authentication account with ROLE_TECHNICIAN
        User techUser = new User(
                username,
                passwordEncoder.encode(password),
                request.getFirstName().trim() + " " + request.getLastName().trim(),
                Role.ROLE_TECHNICIAN
        );
        userRepository.save(techUser);

        // 2. Persist Technician domain entity
        Technician technician = mapToEntity(request);
        Technician savedTechnician = technicianRepository.save(technician);

        TechnicianResponse response = mapToResponse(savedTechnician);
        response.setUsername(username);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public TechnicianResponse getTechnicianById(Long id) {
        Technician technician = technicianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + id));

        return mapToResponse(technician);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TechnicianResponse> getAllTechnicians() {
        return technicianRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TechnicianResponse> getActiveTechnicians() {
        return technicianRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TechnicianResponse> getTechniciansBySpecialization(String specialization) {
        return technicianRepository.findBySpecializationContainingIgnoreCase(specialization)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TechnicianResponse updateTechnician(Long id, TechnicianRequest request) {
        Technician existing = technicianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + id));

        // If email changed, check for conflict
        if (!existing.getEmail().equalsIgnoreCase(request.getEmail())
                && technicianRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Technician with email '" + request.getEmail() + "' already exists");
        }

        existing.setFirstName(request.getFirstName());
        existing.setLastName(request.getLastName());
        existing.setEmail(request.getEmail());
        existing.setPhoneNumber(request.getPhoneNumber());
        existing.setSpecialization(request.getSpecialization());
        if (request.getActive() != null) {
            existing.setActive(request.getActive());
        }

        Technician updated = technicianRepository.save(existing);

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public TechnicianResponse toggleTechnicianStatus(Long id) {
        Technician technician = technicianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + id));

        // Toggle active boolean
        technician.setActive(!technician.isActive());
        Technician updated = technicianRepository.save(technician);

        // Synchronize enabled state with user account
        if (technician.getEmail() != null) {
            String emailPrefix = technician.getEmail().split("@")[0].toLowerCase();
            userRepository.findByUsername(emailPrefix).ifPresent(u -> {
                u.setEnabled(updated.isActive());
                userRepository.save(u);
            });
        }

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteTechnician(Long id) {
        Technician technician = technicianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + id));

        // 1. Unlink any assigned repair tickets (reset to null, revert ASSIGNED to OPEN)
        List<RepairTicket> assignedTickets = repairTicketRepository.findByAssignedTechnicianId(id);
        for (RepairTicket ticket : assignedTickets) {
            ticket.setAssignedTechnician(null);
            if (ticket.getStatus() == TicketStatus.ASSIGNED) {
                ticket.setStatus(TicketStatus.OPEN);
            }
            repairTicketRepository.save(ticket);
        }

        // 2. Unlink any repair updates (preserve update audit history with null technician)
        List<RepairUpdate> updates = repairUpdateRepository.findByTechnicianId(id);
        for (RepairUpdate update : updates) {
            update.setTechnician(null);
            repairUpdateRepository.save(update);
        }

        // 3. Remove corresponding user authentication account
        if (technician.getEmail() != null) {
            String emailPrefix = technician.getEmail().split("@")[0].toLowerCase();
            userRepository.findByUsername(emailPrefix).ifPresent(userRepository::delete);
        }

        // 4. Safely delete technician record
        technicianRepository.delete(technician);
    }

    // Mapping Helpers
    private Technician mapToEntity(TechnicianRequest request) {
        Technician technician = new Technician(
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getPhoneNumber(),
                request.getSpecialization()
        );
        if (request.getActive() != null) {
            technician.setActive(request.getActive());
        }
        return technician;
    }

    private TechnicianResponse mapToResponse(Technician technician) {
        TechnicianResponse response = new TechnicianResponse(
                technician.getId(),
                technician.getFirstName(),
                technician.getLastName(),
                technician.getEmail(),
                technician.getPhoneNumber(),
                technician.getSpecialization(),
                technician.isActive(),
                technician.getCreatedAt(),
                technician.getUpdatedAt()
        );

        // Resolve associated user account username
        if (technician.getEmail() != null) {
            String emailPrefix = technician.getEmail().split("@")[0].toLowerCase();
            userRepository.findByUsername(emailPrefix)
                    .ifPresent(u -> response.setUsername(u.getUsername()));
        }

        return response;
    }
}
