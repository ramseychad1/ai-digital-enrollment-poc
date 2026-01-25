package com.cmrservices.enrollment.controller;

import com.cmrservices.enrollment.service.ContentfulService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Health check controller to verify system components.
 * Provides endpoints to test database and Contentful connectivity.
 */
@RestController
@RequestMapping("/health")
public class HealthCheckController {

    private static final Logger log = LoggerFactory.getLogger(HealthCheckController.class);

    private final JdbcTemplate jdbcTemplate;
    private final ContentfulService contentfulService;

    public HealthCheckController(JdbcTemplate jdbcTemplate, ContentfulService contentfulService) {
        this.jdbcTemplate = jdbcTemplate;
        this.contentfulService = contentfulService;
    }

    /**
     * GET /health
     * Basic health check endpoint.
     *
     * @return status indicating the application is running
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        log.debug("Health check requested");

        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("application", "CMR Services AI Digital Enrollment");

        return ResponseEntity.ok(response);
    }

    /**
     * GET /health/database
     * Checks database connectivity.
     *
     * @return status of database connection
     */
    @GetMapping("/database")
    public ResponseEntity<Map<String, Object>> checkDatabase() {
        log.info("Database health check requested");

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());

        try {
            // Try to execute a simple query
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);

            if (result != null && result == 1) {
                response.put("status", "UP");
                response.put("message", "Database connection successful");
                log.info("Database health check passed");
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "DOWN");
                response.put("message", "Database query returned unexpected result");
                log.error("Database health check failed: unexpected result");
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
            }

        } catch (Exception e) {
            response.put("status", "DOWN");
            response.put("message", "Database connection failed: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            log.error("Database health check failed", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }

    /**
     * GET /health/contentful
     * Checks Contentful connectivity.
     *
     * @return status of Contentful connection
     */
    @GetMapping("/contentful")
    public ResponseEntity<Map<String, Object>> checkContentful() {
        log.info("Contentful health check requested");

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());

        try {
            // Try to fetch programs from Contentful
            contentfulService.getAllPrograms();

            response.put("status", "UP");
            response.put("message", "Contentful connection successful");
            log.info("Contentful health check passed");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("status", "DOWN");
            response.put("message", "Contentful connection failed: " + e.getMessage());
            response.put("error", e.getClass().getSimpleName());
            log.error("Contentful health check failed", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }

    /**
     * GET /health/full
     * Comprehensive health check of all components.
     *
     * @return status of all system components
     */
    @GetMapping("/full")
    public ResponseEntity<Map<String, Object>> fullHealthCheck() {
        log.info("Full health check requested");

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("application", "CMR Services AI Digital Enrollment");

        Map<String, Object> components = new HashMap<>();

        // Check database
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            components.put("database", result != null && result == 1 ? "UP" : "DOWN");
        } catch (Exception e) {
            components.put("database", "DOWN");
            log.error("Database check failed in full health check", e);
        }

        // Check Contentful
        try {
            contentfulService.getAllPrograms();
            components.put("contentful", "UP");
        } catch (Exception e) {
            components.put("contentful", "DOWN");
            log.error("Contentful check failed in full health check", e);
        }

        response.put("components", components);

        // Determine overall status
        boolean allUp = components.values().stream()
                .allMatch(status -> "UP".equals(status));

        response.put("status", allUp ? "UP" : "DEGRADED");

        HttpStatus httpStatus = allUp ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        return ResponseEntity.status(httpStatus).body(response);
    }
}
