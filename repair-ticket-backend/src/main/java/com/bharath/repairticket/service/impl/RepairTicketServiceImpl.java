package com.bharath.repairticket.service.impl;

import com.bharath.repairticket.dto.common.PagedResponse;
import com.bharath.repairticket.dto.ticket.AssignTechnicianRequest;
import com.bharath.repairticket.dto.ticket.CancelTicketRequest;
import com.bharath.repairticket.dto.ticket.RepairTicketRequest;
import com.bharath.repairticket.dto.ticket.RepairTicketResponse;
import com.bharath.repairticket.dto.ticket.StatusUpdateRequest;
import com.bharath.repairticket.dto.ticket.TicketFilterCriteria;
import com.bharath.repairticket.entity.*;
import com.bharath.repairticket.exception.BusinessRuleException;
import com.bharath.repairticket.exception.InvalidStatusTransitionException;
import com.bharath.repairticket.exception.ResourceNotFoundException;
import com.bharath.repairticket.repository.*;
import com.bharath.repairticket.repository.specification.RepairTicketSpecification;
import com.bharath.repairticket.service.RepairTicketService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * RepairTicketServiceImpl
 * 
 * Implements ticket creation, ownership validation, auto-generated ticket numbers,
 * single-query details retrieval via JOIN FETCH, and strict Finite State Machine
 * ticket status workflow enforcement.
 */
@Service
public class RepairTicketServiceImpl implements RepairTicketService {

    private final RepairTicketRepository repairTicketRepository;
    private final CustomerRepository customerRepository;
    private final DeviceRepository deviceRepository;
    private final TechnicianRepository technicianRepository;
    private final RepairUpdateRepository repairUpdateRepository;
    private final UserRepository userRepository;

    public RepairTicketServiceImpl(RepairTicketRepository repairTicketRepository, 
                                    CustomerRepository customerRepository, 
                                    DeviceRepository deviceRepository,
                                    TechnicianRepository technicianRepository,
                                    RepairUpdateRepository repairUpdateRepository,
                                    UserRepository userRepository) {
        this.repairTicketRepository = repairTicketRepository;
        this.customerRepository = customerRepository;
        this.deviceRepository = deviceRepository;
        this.technicianRepository = technicianRepository;
        this.repairUpdateRepository = repairUpdateRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public RepairTicketResponse createTicket(RepairTicketRequest request) {
        // Business Rule 1: Customer must exist
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        // Business Rule 2: Device must exist
        Device device = deviceRepository.findById(request.getDeviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + request.getDeviceId()));

        // Business Rule 3: Integrity check - Device must belong to the specified Customer
        if (!device.getCustomer().getId().equals(customer.getId())) {
            throw new BusinessRuleException("Device (ID: " + device.getId() + ") does not belong to Customer (ID: " + customer.getId() + ")");
        }

        // Generate human-readable, unique ticket tracking number: TICK-YYYYMMDD-XXXX
        String ticketNumber = generateUniqueTicketNumber();

        // Create new ticket: status defaults to OPEN, assignedTechnician is initially null
        RepairTicket ticket = new RepairTicket(
                ticketNumber,
                request.getIssueDescription(),
                request.getPriority(),
                TicketStatus.OPEN,
                customer,
                device
        );

        RepairTicket savedTicket = repairTicketRepository.save(ticket);

        // Automatic Audit Trail: Record initial ticket creation into timeline
        RepairUpdate initialUpdate = new RepairUpdate(
                "Ticket registered in intake queue with priority " + request.getPriority() + ". Pending diagnostic inspection.",
                null,
                TicketStatus.OPEN,
                savedTicket,
                null // Logged by Intake / Service Desk
        );
        savedTicket.addRepairUpdate(initialUpdate);
        repairUpdateRepository.save(initialUpdate);

        return mapToResponse(savedTicket);
    }

    @Override
    @Transactional(readOnly = true)
    public RepairTicketResponse getTicketById(Long id) {
        // Uses JOIN FETCH query from Phase 5 to retrieve ticket, customer, device, and technician in 1 query
        RepairTicket ticket = repairTicketRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Repair ticket not found with id: " + id));

        return mapToResponse(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public RepairTicketResponse getTicketByTicketNumber(String ticketNumber) {
        RepairTicket ticket = repairTicketRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Repair ticket not found with ticket number: " + ticketNumber));

        return mapToResponse(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RepairTicketResponse> getAllTickets() {
        return repairTicketRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<RepairTicketResponse> searchTickets(TicketFilterCriteria criteria, Pageable pageable) {
        Specification<RepairTicket> spec = RepairTicketSpecification.withFilters(criteria);
        Page<RepairTicket> page = repairTicketRepository.findAll(spec, pageable);
        Page<RepairTicketResponse> responsePage = page.map(this::mapToResponse);
        return PagedResponse.from(responsePage);
    }


    @Override
    @Transactional(readOnly = true)
    public List<RepairTicketResponse> getTicketsByCustomerId(Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }

        return repairTicketRepository.findByCustomerId(customerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RepairTicketResponse> getTicketsByStatus(TicketStatus status) {
        return repairTicketRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RepairTicketResponse> getTicketsByPriority(TicketPriority priority) {
        return repairTicketRepository.findByPriority(priority)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RepairTicketResponse updateTicketStatus(Long ticketId, StatusUpdateRequest request) {
        RepairTicket ticket = repairTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair ticket not found with id: " + ticketId));

        TicketStatus currentStatus = ticket.getStatus();
        TicketStatus newStatus = request.getNewStatus();

        // Strict Finite State Machine Validation: Check whether transition is permitted
        if (!currentStatus.canTransitionTo(newStatus)) {
            throw new InvalidStatusTransitionException(currentStatus, newStatus);
        }

        // Apply new status to ticket
        ticket.setStatus(newStatus);
        RepairTicket updatedTicket = repairTicketRepository.save(ticket);

        // Optional technician who authorized or performed this transition
        Technician technician = null;
        if (request.getTechnicianId() != null) {
            technician = technicianRepository.findById(request.getTechnicianId())
                    .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + request.getTechnicianId()));
        }

        // Automatic Audit Trail: Append a new RepairUpdate note for traceability
        String authorLabel = (technician != null) 
                ? ("Specialist " + technician.getFirstName() + " " + technician.getLastName()) 
                : "Operations Service Desk";
        String noteText = (request.getNotes() != null && !request.getNotes().isBlank())
                ? request.getNotes()
                : String.format("Status transitioned from %s to %s by %s", currentStatus, newStatus, authorLabel);

        RepairUpdate update = new RepairUpdate(
                noteText,
                currentStatus,
                newStatus,
                updatedTicket,
                technician
        );
        ticket.addRepairUpdate(update);
        repairUpdateRepository.save(update);

        return mapToResponse(updatedTicket);
    }

    @Override
    @Transactional
    public RepairTicketResponse cancelTicket(Long ticketId, CancelTicketRequest request, String username) {
        RepairTicket ticket = repairTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair ticket not found with id: " + ticketId));

        TicketStatus currentStatus = ticket.getStatus();

        // 1. Guard against terminal or illegal state transitions
        if (currentStatus == TicketStatus.CANCELLED) {
            throw new BusinessRuleException("Repair ticket " + ticket.getTicketNumber() + " is already cancelled.");
        }
        if (currentStatus == TicketStatus.CLOSED || currentStatus == TicketStatus.REPAIR_COMPLETED) {
            throw new BusinessRuleException("Cannot cancel repair ticket " + ticket.getTicketNumber() 
                    + " because its status is already " + currentStatus.name().replace('_', ' ') + ".");
        }
        if (!currentStatus.canTransitionTo(TicketStatus.CANCELLED)) {
            throw new InvalidStatusTransitionException(currentStatus, TicketStatus.CANCELLED);
        }

        // 2. Authorization check: if authenticated caller is not ADMIN, verify customer ownership
        if (username != null && !username.isBlank()) {
            Optional<User> callerUser = userRepository.findByUsername(username);
            boolean isAdmin = callerUser.isPresent() && callerUser.get().getRole() == Role.ROLE_ADMIN;

            if (!isAdmin) {
                Customer ticketCustomer = ticket.getCustomer();
                String custEmail = ticketCustomer.getEmail() != null ? ticketCustomer.getEmail().toLowerCase() : "";
                String lowerUser = username.toLowerCase();

                boolean isOwner = custEmail.equals(lowerUser)
                        || custEmail.startsWith(lowerUser + "@")
                        || (callerUser.isPresent() && callerUser.get().getFullName() != null 
                            && (ticketCustomer.getFirstName() + " " + ticketCustomer.getLastName())
                                .equalsIgnoreCase(callerUser.get().getFullName()));

                if (!isOwner) {
                    // Check if customer profile exists for this user email
                    Optional<Customer> userCustomer = customerRepository.findByEmail(lowerUser + "@omniclient.io");
                    if (userCustomer.isPresent() && !userCustomer.get().getId().equals(ticketCustomer.getId())) {
                        throw new BusinessRuleException("Access Denied: You are not authorized to cancel a ticket that was raised by another customer.");
                    }
                }
            }
        }

        // 3. Transition ticket status to CANCELLED
        ticket.setStatus(TicketStatus.CANCELLED);
        RepairTicket updatedTicket = repairTicketRepository.save(ticket);

        // 4. Record audit log with the mandatory cancellation description
        String authorName = (username != null && !username.isBlank()) ? username : "Customer";
        String cancellationReason = request.getReason() != null ? request.getReason().trim() : "No description provided";
        String noteText = String.format("Ticket cancelled by %s. Reason: %s", authorName, cancellationReason);

        RepairUpdate update = new RepairUpdate(
                noteText,
                currentStatus,
                TicketStatus.CANCELLED,
                updatedTicket,
                null // Cancelled by customer/admin, no active bench technician
        );
        ticket.addRepairUpdate(update);
        repairUpdateRepository.save(update);

        return mapToResponse(updatedTicket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RepairTicketResponse> getTicketsByTechnicianId(Long technicianId) {
        if (!technicianRepository.existsById(technicianId)) {
            throw new ResourceNotFoundException("Technician not found with id: " + technicianId);
        }

        return repairTicketRepository.findByAssignedTechnicianId(technicianId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RepairTicketResponse assignTechnician(Long ticketId, AssignTechnicianRequest request) {
        RepairTicket ticket = repairTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair ticket not found with id: " + ticketId));

        // Business Rule 1: Cannot assign closed or cancelled tickets
        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.CANCELLED) {
            throw new BusinessRuleException("Cannot assign technician to a ticket with status: " + ticket.getStatus());
        }

        // Business Rule 2: Technician must exist
        Technician technician = technicianRepository.findById(request.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + request.getTechnicianId()));

        // Business Rule 3: Technician must be active
        if (!technician.isActive()) {
            throw new BusinessRuleException(String.format("Cannot assign ticket to inactive technician '%s %s' (ID: %d)",
                    technician.getFirstName(), technician.getLastName(), technician.getId()));
        }

        TicketStatus previousStatus = ticket.getStatus();
        // If ticket is OPEN, assigning a technician automatically shifts status to ASSIGNED
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.ASSIGNED);
        }

        ticket.setAssignedTechnician(technician);
        RepairTicket savedTicket = repairTicketRepository.save(ticket);

        // Automatic Audit Trail: Record assignment note
        String assignmentNote = String.format("Ticket assigned to technician: %s %s%s",
                technician.getFirstName(),
                technician.getLastName(),
                (request.getAssignmentNotes() != null && !request.getAssignmentNotes().isBlank()) 
                        ? " - Note: " + request.getAssignmentNotes() 
                        : "");

        RepairUpdate update = new RepairUpdate(
                assignmentNote,
                previousStatus,
                ticket.getStatus(),
                savedTicket,
                technician
        );
        ticket.addRepairUpdate(update);
        repairUpdateRepository.save(update);

        return mapToResponse(savedTicket);
    }

    @Override
    @Transactional
    public RepairTicketResponse unassignTechnician(Long ticketId, String notes) {
        RepairTicket ticket = repairTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair ticket not found with id: " + ticketId));

        if (ticket.getAssignedTechnician() == null) {
            throw new BusinessRuleException("Ticket (ID: " + ticketId + ") does not have an assigned technician");
        }

        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.CANCELLED) {
            throw new BusinessRuleException("Cannot unassign technician from a ticket with status: " + ticket.getStatus());
        }

        Technician previousTechnician = ticket.getAssignedTechnician();
        TicketStatus previousStatus = ticket.getStatus();

        // If ticket was in ASSIGNED status, unassigning rolls it back to OPEN (valid in FSM)
        if (ticket.getStatus() == TicketStatus.ASSIGNED) {
            ticket.setStatus(TicketStatus.OPEN);
        }

        ticket.setAssignedTechnician(null);
        RepairTicket savedTicket = repairTicketRepository.save(ticket);

        // Audit Trail
        String unassignNote = String.format("Technician %s %s unassigned from ticket%s",
                previousTechnician.getFirstName(),
                previousTechnician.getLastName(),
                (notes != null && !notes.isBlank()) ? " - Reason: " + notes : "");

        RepairUpdate update = new RepairUpdate(
                unassignNote,
                previousStatus,
                ticket.getStatus(),
                savedTicket,
                previousTechnician
        );
        ticket.addRepairUpdate(update);
        repairUpdateRepository.save(update);

        return mapToResponse(savedTicket);
    }

    @Override
    @Transactional
    public void deleteTicket(Long id) {
        if (!repairTicketRepository.existsById(id)) {
            throw new ResourceNotFoundException("Repair ticket not found with id: " + id);
        }
        repairTicketRepository.deleteById(id);
    }

    // Ticket number generator
    private String generateUniqueTicketNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "TICK-" + datePart + "-" + randomPart;
    }

    // Mapping Helper
    private RepairTicketResponse mapToResponse(RepairTicket ticket) {
        Customer customer = ticket.getCustomer();
        Device device = ticket.getDevice();
        Technician technician = ticket.getAssignedTechnician();

        String customerName = (customer != null) 
                ? customer.getFirstName() + " " + customer.getLastName() 
                : "Unknown";
        String customerEmail = (customer != null) ? customer.getEmail() : null;
        Long customerId = (customer != null) ? customer.getId() : null;

        Long deviceId = (device != null) ? device.getId() : null;
        String deviceBrand = (device != null) ? device.getBrand() : null;
        String deviceModel = (device != null) ? device.getModel() : null;
        String deviceSerialNumber = (device != null) ? device.getSerialNumber() : null;

        Long technicianId = (technician != null) ? technician.getId() : null;
        String technicianName = (technician != null) 
                ? technician.getFirstName() + " " + technician.getLastName() 
                : "Unassigned";

        return new RepairTicketResponse(
                ticket.getId(),
                ticket.getTicketNumber(),
                ticket.getIssueDescription(),
                ticket.getPriority(),
                ticket.getStatus(),
                customerId,
                customerName,
                customerEmail,
                deviceId,
                deviceBrand,
                deviceModel,
                deviceSerialNumber,
                technicianId,
                technicianName,
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }
}
