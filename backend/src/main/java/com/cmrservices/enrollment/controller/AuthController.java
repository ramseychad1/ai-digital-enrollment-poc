package com.cmrservices.enrollment.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Authentication controller for checking authentication status.
 * Login and logout are handled by Spring Security configuration.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    /**
     * Check if the user is currently authenticated.
     * @return Authentication status and username if authenticated
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAuthStatus() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Map<String, Object> response = new HashMap<>();

        if (authentication != null && authentication.isAuthenticated()
            && !authentication.getName().equals("anonymousUser")) {
            response.put("authenticated", true);
            response.put("username", authentication.getName());
            log.debug("Auth status check: authenticated as {}", authentication.getName());
        } else {
            response.put("authenticated", false);
            log.debug("Auth status check: not authenticated");
        }

        return ResponseEntity.ok(response);
    }
}
