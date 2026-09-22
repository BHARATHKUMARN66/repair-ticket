package com.bharath.repairticket.exception;

/**
 * Thrown when a business logic constraint or domain validation rule is violated.
 * Maps conceptually to HTTP 400 BAD_REQUEST or HTTP 422 UNPROCESSABLE_ENTITY.
 */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
