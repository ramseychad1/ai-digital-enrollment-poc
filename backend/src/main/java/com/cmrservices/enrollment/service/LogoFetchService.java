package com.cmrservices.enrollment.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URI;

@Service
public class LogoFetchService {

    private static final Logger log = LoggerFactory.getLogger(LogoFetchService.class);

    @Value("${logo.api-url}")
    private String logoApiUrl;

    @Value("${logo.api-key}")
    private String apiKey;

    private final WebClient webClient;

    public LogoFetchService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    /**
     * Try to fetch logo using Logo.dev API
     */
    public String fetchLogo(String websiteUrl) {
        log.info("Attempting to fetch logo for: {}", websiteUrl);

        try {
            String domain = extractDomain(websiteUrl);

            // Build Logo.dev URL with API token
            String logoUrl = logoApiUrl + "/" + domain + "?token=" + apiKey + "&format=png&size=400";

            // Test if logo exists by making HEAD request
            boolean exists = testUrl(logoUrl);

            if (exists) {
                log.info("Logo found at Logo.dev: {}", domain);
                return logoUrl;
            } else {
                log.info("Logo not found at Logo.dev for domain: {}", domain);
                return null;
            }

        } catch (Exception e) {
            log.error("Error fetching logo", e);
            return null;
        }
    }

    private String extractDomain(String url) {
        try {
            URI uri = new URI(url);
            String host = uri.getHost();

            // Remove www. if present
            if (host != null && host.startsWith("www.")) {
                host = host.substring(4);
            }

            return host;
        } catch (Exception e) {
            // If parsing fails, try simple string manipulation
            String domain = url.replace("https://", "").replace("http://", "");
            if (domain.startsWith("www.")) {
                domain = domain.substring(4);
            }
            // Remove path if present
            int slashIndex = domain.indexOf('/');
            if (slashIndex > 0) {
                domain = domain.substring(0, slashIndex);
            }
            return domain;
        }
    }

    private boolean testUrl(String url) {
        try {
            if (url == null) {
                return false;
            }

            webClient.head()
                    .uri(url)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
