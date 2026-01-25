package com.cmrservices.enrollment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

/**
 * Main application class for CMR Services AI Digital Enrollment.
 * This is a multi-tenant patient enrollment platform that serves
 * multiple pharmaceutical enrollment programs.
 */
@SpringBootApplication
@EnableCaching
public class EnrollmentApplication {

    private static final Logger log = LoggerFactory.getLogger(EnrollmentApplication.class);

    public static void main(String[] args) {
        // Configure PDFBox 2.x for macOS compatibility
        // PDFBox 2.x has better font error handling than 3.x
        System.setProperty("org.apache.pdfbox.rendering.UsePureJavaCMYKConversion", "true");
        System.setProperty("java.awt.headless", "true");

        log.info("Starting CMR Services AI Digital Enrollment...");
        log.info("PDFBox 2.x configuration: headless mode enabled, pure Java CMYK conversion");

        SpringApplication.run(EnrollmentApplication.class, args);
        log.info("CMR Services AI Digital Enrollment started successfully");
    }
}
