package com.bharath.repairticket.dto.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Custom Bean Validation annotation for international and domestic phone numbers.
 * Validates that the string matches standard telephone formatting.
 */
@Documented
@Constraint(validatedBy = PhoneNumberValidator.class)
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPhoneNumber {

    String message() default "Invalid phone number format. Must be a valid phone number with 7 to 20 digits, optionally starting with '+'";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
