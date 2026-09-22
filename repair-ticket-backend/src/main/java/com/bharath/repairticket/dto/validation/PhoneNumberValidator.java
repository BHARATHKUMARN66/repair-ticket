package com.bharath.repairticket.dto.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

/**
 * Validator implementation for the @ValidPhoneNumber annotation.
 * 
 * Demonstrates how Spring Boot and Hibernate Validator instantiate and invoke
 * custom constraint logic during the validation lifecycle.
 */
public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {

    // Matches numbers with optional international country code (+), spaces, dashes, dots, or parentheses
    private static final String PHONE_REGEX = "^\\+?[0-9 .()-]{7,25}$";
    private static final Pattern PATTERN = Pattern.compile(PHONE_REGEX);

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // If null or blank, allow @NotBlank to handle presence validation (Single Responsibility)
        if (value == null || value.trim().isEmpty()) {
            return true;
        }

        return PATTERN.matcher(value.trim()).matches();
    }
}
