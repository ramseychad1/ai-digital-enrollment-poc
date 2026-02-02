package com.cmrservices.enrollment.service;

import com.contentful.java.cda.CDAArray;
import com.contentful.java.cda.CDAClient;
import com.contentful.java.cda.CDAEntry;
import com.contentful.java.cma.CMAClient;
import com.contentful.java.cma.model.CMAEntry;
import com.contentful.java.cma.model.CMAHttpException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ContentfulManagementService {

    private static final Logger log = LoggerFactory.getLogger(ContentfulManagementService.class);

    @Value("${contentful.space-id}")
    private String spaceId;

    @Value("${contentful.management-token}")
    private String managementToken;

    @Value("${contentful.access-token}")
    private String accessToken;

    @Value("${contentful.environment}")
    private String environment;

    private final ObjectMapper objectMapper;

    public ContentfulManagementService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    private CMAClient getClient() {
        return new CMAClient.Builder()
            .setAccessToken(managementToken)
            .build();
    }

    private CDAClient getDeliveryClient() {
        return CDAClient.builder()
            .setSpace(spaceId)
            .setToken(accessToken)
            .setEnvironment(environment)
            .build();
    }

    /**
     * Create and publish Enrollment Form Schema entry with unique formId
     */
    public String createFormSchema(String formId, String version, String schemaJson) {
        log.info("Creating form schema in Contentful: {}", formId);

        try {
            CMAClient client = getClient();

            // Parse JSON string to object for Contentful
            Object schemaObject;
            try {
                schemaObject = objectMapper.readValue(schemaJson, Object.class);
            } catch (com.fasterxml.jackson.core.JsonParseException e) {
                // Log details about the JSON parsing error
                log.error("Invalid JSON in schema - Parse error at line {}, column {}: {}",
                    e.getLocation().getLineNr(),
                    e.getLocation().getColumnNr(),
                    e.getOriginalMessage());

                // Try to show the problematic area
                String[] lines = schemaJson.split("\n");
                int errorLine = e.getLocation().getLineNr();
                if (errorLine > 0 && errorLine <= lines.length) {
                    int startLine = Math.max(0, errorLine - 3);
                    int endLine = Math.min(lines.length, errorLine + 2);
                    log.error("JSON context around error (lines {}-{}):", startLine + 1, endLine);
                    for (int i = startLine; i < endLine; i++) {
                        String marker = (i + 1 == errorLine) ? " >>> " : "     ";
                        log.error("{}{}: {}", marker, i + 1, lines[i]);
                    }
                }

                throw new RuntimeException("Invalid JSON schema - syntax error at line " + errorLine +
                    ": " + e.getOriginalMessage() +
                    ". Please check the generated JSON in the Review Schema step and fix any syntax errors.", e);
            }

            // Try to create with original formId, if it fails due to uniqueness, append timestamp
            String uniqueFormId = formId;
            int maxAttempts = 5;
            CMAEntry published = null;

            for (int attempt = 0; attempt < maxAttempts; attempt++) {
                try {
                    // Create entry with fields
                    CMAEntry entry = new CMAEntry()
                        .setField("formId", "en-US", uniqueFormId)
                        .setField("version", "en-US", version)
                        .setField("schema", "en-US", schemaObject);

                    // Try to create in Contentful
                    CMAEntry created = client.entries().create(spaceId, environment, "enrollmentFormSchema", entry);
                    log.info("Form schema created successfully with formId: {}", uniqueFormId);

                    // Try to publish (this is where unique constraint is enforced)
                    published = client.entries().publish(created);
                    log.info("Form schema published successfully: {}", published.getId());
                    break; // Success, exit loop

                } catch (CMAHttpException e) {
                    // If 422 error (validation failed - likely unique constraint), append timestamp and retry
                    if (e.toString().contains("422")) {
                        long timestamp = System.currentTimeMillis();
                        uniqueFormId = formId + "-" + timestamp;
                        log.info("FormId collision detected during publish, retrying with: {}", uniqueFormId);

                        if (attempt == maxAttempts - 1) {
                            throw e; // Give up after max attempts
                        }
                    } else {
                        throw e; // Different error, don't retry
                    }
                }
            }

            if (published == null) {
                throw new RuntimeException("Failed to create and publish form schema after " + maxAttempts + " attempts");
            }

            return published.getId();

        } catch (CMAHttpException e) {
            log.error("Contentful HTTP Error - Message: {}", e.getMessage());
            log.error("Contentful HTTP Error - Exception Details: {}", e.toString());
            String errorBody = e.getErrorBody() != null ? e.getErrorBody().toString() : "No error body";
            log.error("Contentful Error Body: {}", errorBody);
            if (e.getCause() != null) {
                log.error("Cause: {}", e.getCause().getMessage());
            }
            throw new RuntimeException("Failed to create form schema in Contentful: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error creating form schema in Contentful", e);
            throw new RuntimeException("Failed to create form schema in Contentful", e);
        }
    }

    /**
     * Create and publish Enrollment Program entry
     */
    public String createProgram(
        String programId,
        String displayName,
        String manufacturer,
        String shortDescription,
        String companyName,
        String footerText,
        String primaryColor,
        String primaryButtonColor,
        String secondaryColor,
        String secondaryButtonColor,
        String headerBackgroundColor,
        String footerBackgroundColor,
        String formBackgroundColor,
        String logoUrl,
        String formSchemaEntryId
    ) {
        log.info("Creating enrollment program in Contentful: {}", programId);

        try {
            CMAClient client = getClient();

            // Create reference to form schema
            Map<String, Object> formSchemaLink = new HashMap<>();
            formSchemaLink.put("sys", Map.of(
                "type", "Link",
                "linkType", "Entry",
                "id", formSchemaEntryId
            ));

            // Create entry with fields
            CMAEntry entry = new CMAEntry()
                .setField("programId", "en-US", programId)
                .setField("displayName", "en-US", displayName)
                .setField("manufacturer", "en-US", manufacturer)
                .setField("shortDescription", "en-US", shortDescription)
                .setField("companyName", "en-US", companyName)
                .setField("footerText", "en-US", footerText != null ? footerText : "")
                .setField("primaryColor", "en-US", primaryColor)
                .setField("primaryButtonColor", "en-US", primaryButtonColor)
                .setField("secondaryColor", "en-US", secondaryColor)
                .setField("secondaryButtonColor", "en-US", secondaryButtonColor)
                .setField("headerBackgroundColor", "en-US", headerBackgroundColor)
                .setField("footerBackgroundColor", "en-US", footerBackgroundColor)
                .setField("formBackgroundColor", "en-US", formBackgroundColor != null ? formBackgroundColor : "#FFFFFF")
                .setField("logoUrl", "en-US", logoUrl)
                .setField("isActive", "en-US", true)
                .setField("formSchema", "en-US", formSchemaLink);

            // Create in Contentful with content type
            CMAEntry created = client.entries().create(spaceId, environment, "enrollmentProgram", entry);

            // Publish
            CMAEntry published = client.entries().publish(created);

            log.info("Enrollment program created and published: {}", published.getId());
            return published.getId();

        } catch (CMAHttpException e) {
            log.error("Contentful HTTP Error - Message: {}", e.getMessage());
            log.error("Contentful HTTP Error - Exception Details: {}", e.toString());
            String errorBody = e.getErrorBody() != null ? e.getErrorBody().toString() : "No error body";
            log.error("Contentful Error Body: {}", errorBody);
            if (e.getCause() != null) {
                log.error("Cause: {}", e.getCause().getMessage());
            }
            throw new RuntimeException("Failed to create enrollment program in Contentful: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error creating enrollment program in Contentful", e);
            throw new RuntimeException("Failed to create enrollment program in Contentful", e);
        }
    }

    /**
     * Update an existing enrollment program in Contentful
     */
    public void updateProgram(
        String programId,
        String displayName,
        String manufacturer,
        String shortDescription,
        String companyName,
        String footerText,
        String primaryColor,
        String primaryButtonColor,
        String secondaryColor,
        String secondaryButtonColor,
        String headerBackgroundColor,
        String footerBackgroundColor,
        String formBackgroundColor,
        String logoUrl
    ) {
        log.info("Updating enrollment program in Contentful: {}", programId);

        try {
            CMAClient client = getClient();

            // First, find the entry by programId
            String entryId = findEntryIdByProgramId(programId);
            if (entryId == null) {
                throw new RuntimeException("Program not found with ID: " + programId);
            }

            // Fetch the existing entry - modify it directly to preserve all system metadata
            CMAEntry entry = client.entries().fetchOne(spaceId, environment, entryId);
            log.info("Fetched entry {} with version {}", entryId, entry.getVersion());

            // Update the fields directly on the existing entry
            entry.setField("displayName", "en-US", displayName);
            entry.setField("manufacturer", "en-US", manufacturer);
            entry.setField("shortDescription", "en-US", shortDescription);
            entry.setField("companyName", "en-US", companyName);
            if (footerText != null && !footerText.isEmpty()) {
                entry.setField("footerText", "en-US", footerText);
            }
            entry.setField("primaryColor", "en-US", primaryColor);
            entry.setField("primaryButtonColor", "en-US", primaryButtonColor);
            entry.setField("secondaryColor", "en-US", secondaryColor);
            entry.setField("secondaryButtonColor", "en-US", secondaryButtonColor);
            entry.setField("headerBackgroundColor", "en-US", headerBackgroundColor);
            entry.setField("footerBackgroundColor", "en-US", footerBackgroundColor);
            entry.setField("formBackgroundColor", "en-US", formBackgroundColor != null ? formBackgroundColor : "#FFFFFF");
            if (logoUrl != null && !logoUrl.isEmpty()) {
                entry.setField("logoUrl", "en-US", logoUrl);
            }

            // Update the entry
            log.info("Updating entry with version {}", entry.getVersion());
            CMAEntry updated = client.entries().update(entry);
            log.info("Entry updated, new version: {}", updated.getVersion());

            // Publish the updated entry
            CMAEntry published = client.entries().publish(updated);
            log.info("Entry published, version: {}", published.getVersion());

            log.info("Enrollment program updated and published: {}", programId);

        } catch (CMAHttpException e) {
            log.error("Contentful HTTP Error - Message: {}", e.getMessage());
            log.error("Contentful HTTP Error - Exception Details: {}", e.toString());
            // Try to get the response body for more details
            String errorBody = e.getErrorBody() != null ? e.getErrorBody().toString() : "No error body";
            log.error("Contentful Error Body: {}", errorBody);
            if (e.getCause() != null) {
                log.error("Cause: {}", e.getCause().getMessage());
            }
            throw new RuntimeException("Failed to update enrollment program in Contentful: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error updating enrollment program in Contentful", e);
            throw new RuntimeException("Failed to update enrollment program in Contentful", e);
        }
    }

    /**
     * Update an existing enrollment program with a new form schema
     */
    public void updateProgramWithSchema(
        String programId,
        String displayName,
        String manufacturer,
        String shortDescription,
        String companyName,
        String footerText,
        String primaryColor,
        String primaryButtonColor,
        String secondaryColor,
        String secondaryButtonColor,
        String headerBackgroundColor,
        String footerBackgroundColor,
        String formBackgroundColor,
        String logoUrl,
        String formSchemaEntryId
    ) {
        log.info("Updating enrollment program with new schema in Contentful: {}", programId);

        try {
            CMAClient client = getClient();

            // First, find the entry by programId
            String entryId = findEntryIdByProgramId(programId);
            if (entryId == null) {
                throw new RuntimeException("Program not found with ID: " + programId);
            }

            // Fetch the existing entry - modify it directly to preserve all system metadata
            CMAEntry entry = client.entries().fetchOne(spaceId, environment, entryId);
            log.info("Fetched entry {} with version {}", entryId, entry.getVersion());

            // Create reference to the new form schema
            Map<String, Object> formSchemaLink = new HashMap<>();
            formSchemaLink.put("sys", Map.of(
                "type", "Link",
                "linkType", "Entry",
                "id", formSchemaEntryId
            ));

            // Update the fields directly on the existing entry
            entry.setField("displayName", "en-US", displayName);
            entry.setField("manufacturer", "en-US", manufacturer);
            entry.setField("shortDescription", "en-US", shortDescription);
            entry.setField("companyName", "en-US", companyName);
            if (footerText != null && !footerText.isEmpty()) {
                entry.setField("footerText", "en-US", footerText);
            }
            entry.setField("primaryColor", "en-US", primaryColor);
            entry.setField("primaryButtonColor", "en-US", primaryButtonColor);
            entry.setField("secondaryColor", "en-US", secondaryColor);
            entry.setField("secondaryButtonColor", "en-US", secondaryButtonColor);
            entry.setField("headerBackgroundColor", "en-US", headerBackgroundColor);
            entry.setField("footerBackgroundColor", "en-US", footerBackgroundColor);
            entry.setField("formBackgroundColor", "en-US", formBackgroundColor != null ? formBackgroundColor : "#FFFFFF");
            if (logoUrl != null && !logoUrl.isEmpty()) {
                entry.setField("logoUrl", "en-US", logoUrl);
            }
            // Update the form schema reference
            entry.setField("formSchema", "en-US", formSchemaLink);

            // Update the entry
            log.info("Updating entry with version {}", entry.getVersion());
            CMAEntry updated = client.entries().update(entry);
            log.info("Entry updated, new version: {}", updated.getVersion());

            // Publish the updated entry
            CMAEntry published = client.entries().publish(updated);
            log.info("Entry published, version: {}", published.getVersion());

            log.info("Enrollment program updated with new schema and published: {}", programId);

        } catch (CMAHttpException e) {
            log.error("Contentful HTTP Error - Message: {}", e.getMessage());
            log.error("Contentful HTTP Error - Exception Details: {}", e.toString());
            String errorBody = e.getErrorBody() != null ? e.getErrorBody().toString() : "No error body";
            log.error("Contentful Error Body: {}", errorBody);
            if (e.getCause() != null) {
                log.error("Cause: {}", e.getCause().getMessage());
            }
            throw new RuntimeException("Failed to update enrollment program with schema in Contentful: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error updating enrollment program with schema in Contentful", e);
            throw new RuntimeException("Failed to update enrollment program with schema in Contentful", e);
        }
    }

    /**
     * Delete an enrollment program and its associated form schema from Contentful
     */
    public void deleteProgram(String programId) {
        log.info("Deleting enrollment program and form schema from Contentful: {}", programId);

        try {
            CMAClient client = getClient();

            // First, find the program entry by programId
            String programEntryId = findEntryIdByProgramId(programId);
            if (programEntryId == null) {
                throw new RuntimeException("Program not found with ID: " + programId);
            }

            // Fetch the program entry to get the form schema reference
            CMAEntry programEntry = client.entries().fetchOne(spaceId, environment, programEntryId);
            log.info("Fetched program entry {} with version {}", programEntryId, programEntry.getVersion());

            // Extract form schema entry ID from the program's formSchema field
            String formSchemaEntryId = null;
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> formSchemaField = (Map<String, Object>) programEntry.getFields().get("formSchema");
                if (formSchemaField != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> enUsValue = (Map<String, Object>) formSchemaField.get("en-US");
                    if (enUsValue != null) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> sys = (Map<String, Object>) enUsValue.get("sys");
                        if (sys != null) {
                            formSchemaEntryId = (String) sys.get("id");
                            log.info("Found form schema entry ID: {}", formSchemaEntryId);
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Could not extract form schema ID from program entry: {}", e.getMessage());
            }

            // 1. Unpublish and delete the program entry first (it references the form schema)
            try {
                client.entries().unPublish(programEntry);
                log.info("Program entry unpublished: {}", programEntryId);
            } catch (CMAHttpException e) {
                log.warn("Could not unpublish program entry (may already be unpublished): {}", e.getMessage());
            }

            // Fetch again to get updated version after unpublish
            programEntry = client.entries().fetchOne(spaceId, environment, programEntryId);
            client.entries().delete(programEntry);
            log.info("Program entry deleted: {}", programEntryId);

            // 2. Now delete the form schema entry if we found one
            if (formSchemaEntryId != null) {
                try {
                    CMAEntry formSchemaEntry = client.entries().fetchOne(spaceId, environment, formSchemaEntryId);
                    log.info("Fetched form schema entry {} with version {}", formSchemaEntryId, formSchemaEntry.getVersion());

                    // Unpublish the form schema
                    try {
                        client.entries().unPublish(formSchemaEntry);
                        log.info("Form schema entry unpublished: {}", formSchemaEntryId);
                    } catch (CMAHttpException e) {
                        log.warn("Could not unpublish form schema entry (may already be unpublished): {}", e.getMessage());
                    }

                    // Fetch again and delete
                    formSchemaEntry = client.entries().fetchOne(spaceId, environment, formSchemaEntryId);
                    client.entries().delete(formSchemaEntry);
                    log.info("Form schema entry deleted: {}", formSchemaEntryId);

                } catch (Exception e) {
                    log.warn("Could not delete form schema entry {}: {}", formSchemaEntryId, e.getMessage());
                    // Don't fail the whole operation if form schema deletion fails
                }
            } else {
                log.warn("No form schema entry found for program: {}", programId);
            }

            log.info("Enrollment program and form schema deleted successfully: {}", programId);

        } catch (CMAHttpException e) {
            log.error("Contentful HTTP Error - Message: {}", e.getMessage());
            log.error("Contentful HTTP Error - Exception Details: {}", e.toString());
            String errorBody = e.getErrorBody() != null ? e.getErrorBody().toString() : "No error body";
            log.error("Contentful Error Body: {}", errorBody);
            if (e.getCause() != null) {
                log.error("Cause: {}", e.getCause().getMessage());
            }
            throw new RuntimeException("Failed to delete enrollment program from Contentful: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error deleting enrollment program from Contentful", e);
            throw new RuntimeException("Failed to delete enrollment program from Contentful", e);
        }
    }

    /**
     * Find the Contentful entry ID by programId field
     */
    private String findEntryIdByProgramId(String programId) {
        log.info("Finding entry ID for program: {}", programId);

        try {
            CDAClient deliveryClient = getDeliveryClient();

            CDAArray result = deliveryClient.fetch(CDAEntry.class)
                .withContentType("enrollmentProgram")
                .where("fields.programId", programId)
                .all();

            if (result.items().isEmpty()) {
                log.warn("No entry found for programId: {}", programId);
                return null;
            }

            CDAEntry entry = (CDAEntry) result.items().get(0);
            String entryId = entry.id();
            log.info("Found entry ID {} for programId {}", entryId, programId);
            return entryId;

        } catch (Exception e) {
            log.error("Error finding entry ID for programId: {}", programId, e);
            throw new RuntimeException("Failed to find program entry", e);
        }
    }
}
