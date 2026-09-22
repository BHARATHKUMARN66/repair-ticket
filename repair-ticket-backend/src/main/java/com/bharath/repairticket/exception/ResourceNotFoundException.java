package com.bharath.repairticket.exception;

/**
 * Thrown when a requested entity cannot be found in the database.
 * Maps conceptually to HTTP 404 NOT_FOUND.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
