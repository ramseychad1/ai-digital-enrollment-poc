package com.cmrservices.enrollment.config;

import com.contentful.java.cda.CDAClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for Contentful CMS client.
 * Contentful stores the form schemas and program information.
 */
@Configuration
public class ContentfulConfig {

    private static final Logger log = LoggerFactory.getLogger(ContentfulConfig.class);

    @Value("${contentful.space-id}")
    private String spaceId;

    @Value("${contentful.access-token}")
    private String accessToken;

    @Value("${contentful.environment}")
    private String environment;

    /**
     * Creates and configures the Contentful CDA (Content Delivery API) client.
     * This client is used to fetch form schemas and program information.
     *
     * @return configured CDAClient instance
     */
    @Bean
    public CDAClient contentfulClient() {
        log.info("Initializing Contentful client for space: {} and environment: {}",
                 spaceId, environment);

        CDAClient client = CDAClient.builder()
                .setSpace(spaceId)
                .setToken(accessToken)
                .setEnvironment(environment)
                .build();

        log.info("Contentful client initialized successfully");
        return client;
    }
}
