package com.bharath.repairticket.service;

import com.bharath.repairticket.dto.common.PagedResponse;
import com.bharath.repairticket.dto.ticket.AssignTechnicianRequest;
import com.bharath.repairticket.dto.ticket.CancelTicketRequest;
import com.bharath.repairticket.dto.ticket.RepairTicketRequest;
import com.bharath.repairticket.dto.ticket.RepairTicketResponse;
import com.bharath.repairticket.dto.ticket.StatusUpdateRequest;
import com.bharath.repairticket.dto.ticket.TicketFilterCriteria;
import com.bharath.repairticket.entity.TicketPriority;
import com.bharath.repairticket.entity.TicketStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * RepairTicketService Interface
 * 
 * Defines core lifecycle operations for repair ticket requests.
 */
public interface RepairTicketService {

    RepairTicketResponse createTicket(RepairTicketRequest request);

    RepairTicketResponse getTicketById(Long id);

    RepairTicketResponse getTicketByTicketNumber(String ticketNumber);

    List<RepairTicketResponse> getAllTickets();

    PagedResponse<RepairTicketResponse> searchTickets(TicketFilterCriteria criteria, Pageable pageable);

    List<RepairTicketResponse> getTicketsByCustomerId(Long customerId);

    List<RepairTicketResponse> getTicketsByStatus(TicketStatus status);

    List<RepairTicketResponse> getTicketsByPriority(TicketPriority priority);

    List<RepairTicketResponse> getTicketsByTechnicianId(Long technicianId);

    RepairTicketResponse updateTicketStatus(Long ticketId, StatusUpdateRequest request);

    RepairTicketResponse cancelTicket(Long ticketId, CancelTicketRequest request, String username);

    RepairTicketResponse assignTechnician(Long ticketId, AssignTechnicianRequest request);

    RepairTicketResponse unassignTechnician(Long ticketId, String notes);

    void deleteTicket(Long id);
}

