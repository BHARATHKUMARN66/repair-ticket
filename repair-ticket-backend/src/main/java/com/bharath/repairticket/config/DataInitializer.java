package com.bharath.repairticket.config;

import com.bharath.repairticket.entity.Customer;
import com.bharath.repairticket.entity.Role;
import com.bharath.repairticket.entity.Technician;
import com.bharath.repairticket.entity.User;
import com.bharath.repairticket.repository.CustomerRepository;
import com.bharath.repairticket.repository.TechnicianRepository;
import com.bharath.repairticket.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * DataInitializer
 * 
 * Automatically provisions initial administrative and operational accounts on application startup
 * if the database is fresh or empty (e.g., when deployed to Render or initialized locally).
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TechnicianRepository technicianRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           TechnicianRepository technicianRepository,
                           CustomerRepository customerRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.technicianRepository = technicianRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // 1. Initialize or Reset Master Administrator
        userRepository.findByUsername("admin").ifPresentOrElse(
                admin -> {
                    admin.setPassword(passwordEncoder.encode("Admin@OmniFix2026!"));
                    admin.setEnabled(true);
                    admin.setRole(Role.ROLE_ADMIN);
                    userRepository.save(admin);
                },
                () -> {
                    User admin = new User(
                            "admin",
                            passwordEncoder.encode("Admin@OmniFix2026!"),
                            "Operations Administrator",
                            Role.ROLE_ADMIN
                    );
                    userRepository.save(admin);
                }
        );

        // 2. Initialize Workshop Specialist Technician
        userRepository.findByUsername("tech_marcus_vance").ifPresentOrElse(
                tech -> {
                    tech.setPassword(passwordEncoder.encode("Tech@OmniFix2026!"));
                    tech.setEnabled(true);
                    tech.setRole(Role.ROLE_TECHNICIAN);
                    userRepository.save(tech);
                },
                () -> {
                    User techUser = new User(
                            "tech_marcus_vance",
                            passwordEncoder.encode("Tech@OmniFix2026!"),
                            "Marcus Vance",
                            Role.ROLE_TECHNICIAN
                    );
                    userRepository.save(techUser);
                }
        );

        if (technicianRepository.findByEmail("marcus.vance@omnifix.workshop").isEmpty()) {
            Technician tech = new Technician(
                    "Marcus",
                    "Vance",
                    "marcus.vance@omnifix.workshop",
                    "+1-555-0199",
                    "Logic Board & Display Specialist"
            );
            technicianRepository.save(tech);
        }

        // 3. Initialize Demo Customer Client
        userRepository.findByUsername("alexmercer").ifPresentOrElse(
                cust -> {
                    cust.setPassword(passwordEncoder.encode("Client@OmniFix2026!"));
                    cust.setEnabled(true);
                    cust.setRole(Role.ROLE_USER);
                    userRepository.save(cust);
                },
                () -> {
                    User custUser = new User(
                            "alexmercer",
                            passwordEncoder.encode("Client@OmniFix2026!"),
                            "Alex Mercer",
                            Role.ROLE_USER
                    );
                    userRepository.save(custUser);
                }
        );

        if (customerRepository.findByEmail("alex.mercer@client.io").isEmpty()) {
            Customer customer = new Customer(
                    "Alex",
                    "Mercer",
                    "alex.mercer@client.io",
                    "+1-555-0144",
                    "742 Evergreen Terrace"
            );
            customerRepository.save(customer);
        }
    }
}
