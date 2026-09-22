package com.bharath.repairticket.entity;

/**
 * Roles for authorization in Spring Security:
 * - ROLE_USER: Can submit repair requests and view own tickets/devices
 * - ROLE_TECHNICIAN: Can view assigned tickets, post repair updates, change status
 * - ROLE_ADMIN: Full management permissions
 */
public enum Role {
    ROLE_USER,
    ROLE_TECHNICIAN,
    ROLE_ADMIN
}
