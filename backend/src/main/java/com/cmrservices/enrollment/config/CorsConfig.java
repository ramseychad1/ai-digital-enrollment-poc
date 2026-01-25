package com.cmrservices.enrollment.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * CORS configuration to allow frontend (Angular) to communicate with backend.
 * Supports both local development and Railway production deployment.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private static final Logger log = LoggerFactory.getLogger(CorsConfig.class);

    @Value("${cors.allowed-origins:http://localhost:4201}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Parse allowed origins from environment variable or use defaults
        List<String> origins = new ArrayList<>(Arrays.asList(allowedOrigins.split(",")));

        // Always include localhost for local development
        if (!origins.contains("http://localhost:4201")) {
            origins.add("http://localhost:4201");
        }
        if (!origins.contains("http://localhost:4200")) {
            origins.add("http://localhost:4200");
        }

        String[] originsArray = origins.toArray(new String[0]);

        log.info("Configuring CORS to allow requests from: {}", String.join(", ", originsArray));

        registry.addMapping("/**")
                .allowedOrigins(originsArray)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
