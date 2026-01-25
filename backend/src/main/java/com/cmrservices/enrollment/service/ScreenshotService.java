package com.cmrservices.enrollment.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Base64;

/**
 * Service for capturing website screenshots using ScreenshotOne API.
 * Falls back gracefully when screenshots cannot be captured.
 */
@Service
public class ScreenshotService {

    private static final Logger log = LoggerFactory.getLogger(ScreenshotService.class);

    private final String apiKey;
    private final WebClient webClient;

    public ScreenshotService(
        WebClient.Builder webClientBuilder,
        @Value("${screenshotone.api-key:aOt9x1L7u7SLsw}") String apiKey
    ) {
        this.webClient = webClientBuilder.build();
        this.apiKey = apiKey;
        log.info("ScreenshotService initialized with API key: {}...", apiKey.substring(0, Math.min(6, apiKey.length())));
    }

    /**
     * Capture screenshot of website and return as base64
     * Returns null if screenshot fails (e.g., site blocks access)
     */
    public String captureScreenshot(String websiteUrl) {
        log.info("Capturing screenshot of: {}", websiteUrl);

        try {
            // Call ScreenshotOne API
            byte[] imageBytes = webClient.get()
                .uri(uriBuilder -> uriBuilder
                    .scheme("https")
                    .host("api.screenshotone.com")
                    .path("/take")
                    .queryParam("access_key", apiKey)
                    .queryParam("url", websiteUrl)
                    .queryParam("viewport_width", "1440")
                    .queryParam("viewport_height", "900")
                    .queryParam("format", "png")
                    .queryParam("full_page", "false")
                    .queryParam("delay", "3")  // Wait 3 seconds for JS to load
                    .queryParam("block_ads", "true")
                    .queryParam("block_cookie_banners", "true")
                    .build())
                .retrieve()
                .bodyToMono(byte[].class)
                .timeout(Duration.ofSeconds(60))
                .block();

            if (imageBytes == null || imageBytes.length == 0) {
                log.warn("Screenshot API returned empty response");
                return null;
            }

            String base64 = Base64.getEncoder().encodeToString(imageBytes);
            log.info("Screenshot captured successfully, size: {} bytes", imageBytes.length);

            return base64;

        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            // Handle HTTP errors from ScreenshotOne (403, 500, etc from target website)
            log.warn("Screenshot capture failed for URL: {} - HTTP {}", websiteUrl, e.getStatusCode());
            log.debug("Full error: {}", e.getMessage());
            return null;
        } catch (Exception e) {
            log.error("Screenshot capture failed for URL: {}", websiteUrl);
            log.error("Error: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Check if the service is ready (always true for API-based service)
     */
    public boolean isReady() {
        return true;
    }
}
