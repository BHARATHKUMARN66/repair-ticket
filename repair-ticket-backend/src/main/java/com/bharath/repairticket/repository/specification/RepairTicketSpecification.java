package com.bharath.repairticket.repository.specification;

import com.bharath.repairticket.dto.ticket.TicketFilterCriteria;
import com.bharath.repairticket.entity.Customer;
import com.bharath.repairticket.entity.RepairTicket;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * RepairTicketSpecification
 * 
 * Dynamic JPA Specification builder for RepairTicket entities.
 * Generates SQL WHERE clauses dynamically based on non-null filter parameters
 * using the JPA Criteria API.
 */
public class RepairTicketSpecification {

    public static Specification<RepairTicket> withFilters(TicketFilterCriteria criteria) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (criteria == null) {
                return criteriaBuilder.conjunction();
            }

            // 1. Partial Case-Insensitive Free-Text Search across ticket number, description, or customer name
            if (criteria.getSearch() != null && !criteria.getSearch().trim().isEmpty()) {
                String searchPattern = "%" + criteria.getSearch().trim().toLowerCase() + "%";
                Join<RepairTicket, Customer> customerJoin = root.join("customer", JoinType.LEFT);

                Predicate ticketNumberPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("ticketNumber")), searchPattern);
                Predicate descriptionPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("issueDescription")), searchPattern);
                Predicate customerFirstPredicate = criteriaBuilder.like(criteriaBuilder.lower(customerJoin.get("firstName")), searchPattern);
                Predicate customerLastPredicate = criteriaBuilder.like(criteriaBuilder.lower(customerJoin.get("lastName")), searchPattern);

                predicates.add(criteriaBuilder.or(ticketNumberPredicate, descriptionPredicate, customerFirstPredicate, customerLastPredicate));
            }

            // 2. Filter by Lifecycle Status
            if (criteria.getStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), criteria.getStatus()));
            }

            // 3. Filter by Urgency Priority
            if (criteria.getPriority() != null) {
                predicates.add(criteriaBuilder.equal(root.get("priority"), criteria.getPriority()));
            }

            // 4. Filter by Customer ID
            if (criteria.getCustomerId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("customer").get("id"), criteria.getCustomerId()));
            }

            // 5. Filter by Assigned Technician ID
            if (criteria.getTechnicianId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("assignedTechnician").get("id"), criteria.getTechnicianId()));
            }

            // 6. Filter by Created Date Range
            if (criteria.getStartDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), criteria.getStartDate().atStartOfDay()));
            }
            if (criteria.getEndDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), criteria.getEndDate().atTime(LocalTime.MAX)));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
