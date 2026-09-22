package com.bharath.repairticket.service.impl;

import com.bharath.repairticket.dto.repairupdate.RepairUpdateRequest;
import com.bharath.repairticket.dto.repairupdate.RepairUpdateResponse;
import com.bharath.repairticket.entity.RepairTicket;
import com.bharath.repairticket.entity.RepairUpdate;
import com.bharath.repairticket.entity.Technician;
import com.bharath.repairticket.entity.TicketStatus;
import com.bharath.repairticket.exception.InvalidStatusTransitionException;
import com.bharath.repairticket.exception.ResourceNotFoundException;
import com.bharath.repairticket.repository.RepairTicketRepository;
import com.bharath.repairticket.repository.RepairUpdateRepository;
import com.bharath.repairticket.repository.TechnicianRepository;
import com.bharath.repairticket.service.RepairUpdateService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * RepairUpdateServiceImpl
 * 
 * Implements ticket update logging, chronological timeline queries,
 * and maintains bidirectional consistency between RepairTicket and RepairUpdate.
 */
@Service
public class RepairUpdateServiceImpl implements RepairUpdateService {

    private final RepairUpdateRepository repairUpdateRepository;
    private final RepairTicketRepository repairTicketRepository;
    private final TechnicianRepository technicianRepository;

    public RepairUpdateServiceImpl(RepairUpdateRepository repairUpdateRepository,
                                   RepairTicketRepository repairTicketRepository,
                                   TechnicianRepository technicianRepository) {
        this.repairUpdateRepository = repairUpdateRepository;
        this.repairTicketRepository = repairTicketRepository;
        this.technicianRepository = technicianRepository;
    }

    @Override
    @Transactional
    public RepairUpdateResponse addUpdateToTicket(Long ticketId, RepairUpdateRequest request) {
        // Verify ticket exists
        RepairTicket ticket = repairTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair ticket not found with id: " + ticketId));

        // Capture previous status
        TicketStatus previousStatus = ticket.getStatus();
        TicketStatus newStatus = (request.getNewStatus() != null) ? request.getNewStatus() : previousStatus;

        // If new status is specified, validate transition through Finite State Machine
        if (request.getNewStatus() != null && request.getNewStatus() != previousStatus) {
            if (!previousStatus.canTransitionTo(request.getNewStatus())) {
                throw new InvalidStatusTransitionException(previousStatus, request.getNewStatus());
            }
            ticket.setStatus(request.getNewStatus());
            repairTicketRepository.save(ticket);
        }

        // Optional technician lookup
        Technician technician = null;
        if (request.getTechnicianId() != null) {
            technician = technicianRepository.findById(request.getTechnicianId())
                    .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + request.getTechnicianId()));
        }

        // Build new update entry
        RepairUpdate update = new RepairUpdate(
                request.getNotes(),
                previousStatus,
                newStatus,
                ticket,
                technician
        );

        // Keep in-memory bidirectional relation in sync
        ticket.addRepairUpdate(update);

        RepairUpdate savedUpdate = repairUpdateRepository.save(update);

        return mapToResponse(savedUpdate);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RepairUpdateResponse> getUpdatesByTicketId(Long ticketId) {
        if (!repairTicketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Repair ticket not found with id: " + ticketId);
        }

        // Returns updates in descending chronological order (newest first)
        return repairUpdateRepository.findByRepairTicketIdOrderByCreatedAtDesc(ticketId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RepairUpdateResponse> getUpdatesByTicketNumber(String ticketNumber) {
        RepairTicket ticket = repairTicketRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Repair ticket not found with ticket number: " + ticketNumber));

        return repairUpdateRepository.findByRepairTicketIdOrderByCreatedAtDesc(ticket.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RepairUpdateResponse getUpdateById(Long updateId) {
        RepairUpdate update = repairUpdateRepository.findById(updateId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair update not found with id: " + updateId));

        return mapToResponse(update);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RepairUpdateResponse> getUpdatesByTechnicianId(Long technicianId) {
        if (!technicianRepository.existsById(technicianId)) {
            throw new ResourceNotFoundException("Technician not found with id: " + technicianId);
        }

        return repairUpdateRepository.findByTechnicianId(technicianId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Mapping Helper
    private RepairUpdateResponse mapToResponse(RepairUpdate update) {
        RepairTicket ticket = update.getRepairTicket();
        Technician technician = update.getTechnician();

        Long ticketId = (ticket != null) ? ticket.getId() : null;
        String ticketNumber = (ticket != null) ? ticket.getTicketNumber() : "Unknown";

        Long technicianId = (technician != null) ? technician.getId() : null;
        String technicianName = (technician != null) 
                ? technician.getFirstName() + " " + technician.getLastName() 
                : "Operations Service Desk";

        return new RepairUpdateResponse(
                update.getId(),
                ticketId,
                ticketNumber,
                update.getNotes(),
                update.getPreviousStatus(),
                update.getNewStatus(),
                technicianId,
                technicianName,
                update.getCreatedAt()
        );
    }
}
