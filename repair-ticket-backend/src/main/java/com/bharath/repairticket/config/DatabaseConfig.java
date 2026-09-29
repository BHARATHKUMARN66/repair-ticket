package com.bharath.repairticket.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * DatabaseConfig
 * 
 * Configures the HikariCP DataSource.
 * Automatically normalizes Render/Heroku connection strings (e.g., postgres://user:pass@host:port/db)
 * into standard JDBC format (jdbc:postgresql://host:port/db) and extracts credentials if embedded.
 */
@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/repair_ticket_db}")
    private String dbUrl;

    @Value("${spring.datasource.username:postgres}")
    private String username;

    @Value("${spring.datasource.password:postgres}")
    private String password;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        String cleanUrl = dbUrl.trim();
        String resolvedUser = username;
        String resolvedPass = password;

        if (cleanUrl.startsWith("postgres://") || cleanUrl.startsWith("postgresql://")) {
            try {
                URI uri = new URI(cleanUrl);
                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":", 2);
                    resolvedUser = userInfo[0];
                    if (userInfo.length > 1) {
                        resolvedPass = userInfo[1];
                    }
                }
                int port = uri.getPort() != -1 ? uri.getPort() : 5432;
                String path = uri.getPath(); // e.g. /repair_ticket_db
                cleanUrl = "jdbc:postgresql://" + uri.getHost() + ":" + port + path;
            } catch (URISyntaxException e) {
                cleanUrl = "jdbc:" + cleanUrl;
            }
        } else if (!cleanUrl.startsWith("jdbc:")) {
            cleanUrl = "jdbc:" + cleanUrl;
        }

        config.setJdbcUrl(cleanUrl);
        config.setUsername(resolvedUser);
        config.setPassword(resolvedPass);
        config.setDriverClassName("org.postgresql.Driver");
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(300000);
        config.setConnectionTimeout(20000);

        return new HikariDataSource(config);
    }
}
