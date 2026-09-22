package com.bharath.repairticket.exception;

/**
 * Thrown when an entity violates a unique constraint (e.g., duplicate email or serial number).
 * Maps conceptually to HTTP 409 CONFLICT.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
