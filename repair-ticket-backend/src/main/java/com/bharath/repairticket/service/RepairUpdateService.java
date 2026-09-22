package com.bharath.repairticket.service;

import com.bharath.repairticket.dto.repairupdate.RepairUpdateRequest;
import com.bharath.repairticket.dto.repairupdate.RepairUpdateResponse;

import java.util.List;

/**
 * RepairUpdateService Interface
 * 
 * Defines business operations for recording diagnostic work notes,
 * status transitions, and retrieving chronological ticket histories.
 */
public interface RepairUpdateService {

    RepairUpdateResponse addUpdateToTicket(Long ticketId, RepairUpdateRequest request);

    List<RepairUpdateResponse> getUpdatesByTicketId(Long ticketId);

    List<RepairUpdateResponse> getUpdatesByTicketNumber(String ticketNumber);

    RepairUpdateResponse getUpdateById(Long updateId);

    List<RepairUpdateResponse> getUpdatesByTechnicianId(Long technicianId);
}
