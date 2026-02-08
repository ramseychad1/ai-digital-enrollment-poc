package com.cmrservices.enrollment.service;

import com.cmrservices.enrollment.model.dto.FormSchemaDTO;
import com.cmrservices.enrollment.model.dto.ProgramDTO;
import com.contentful.java.cda.CDAArray;
import com.contentful.java.cda.CDAClient;
import com.contentful.java.cda.CDAEntry;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for fetching data from Contentful CMS.
 * Handles enrollment programs and form schemas.
 */
@Service
public class ContentfulService {

    private static final Logger log = LoggerFactory.getLogger(ContentfulService.class);

    private final CDAClient contentfulClient;
    private final ObjectMapper objectMapper;

    public ContentfulService(CDAClient contentfulClient) {
        this.contentfulClient = contentfulClient;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Fetches all active enrollment programs from Contentful.
     * Results are cached to improve performance.
     *
     * @return list of active programs
     */
    @Cacheable("contentful-programs")
    public List<ProgramDTO> getAllPrograms() {
        log.info("Fetching all programs from Contentful");

        try {
            CDAArray result = contentfulClient.fetch(CDAEntry.class)
                    .withContentType("enrollmentProgram")
                    .all();

            List<ProgramDTO> programs = result.items().stream()
                    .filter(item -> item instanceof CDAEntry)
                    .map(item -> (CDAEntry) item)
                    .map(this::mapToProgram)
                    .filter(program -> program.getIsActive() != null && program.getIsActive())
                    .collect(Collectors.toList());

            log.info("Successfully fetched {} active programs from Contentful", programs.size());
            return programs;

        } catch (Exception e) {
            log.error("Error fetching programs from Contentful", e);
            throw new RuntimeException("Failed to fetch programs from Contentful", e);
        }
    }

    /**
     * Fetches a specific program by ID from Contentful.
     * Results are cached to improve performance.
     *
     * @param programId the program ID
     * @return Optional containing the program if found
     */
    @Cacheable("contentful-programs")
    public Optional<ProgramDTO> getProgramById(String programId) {
        log.info("Fetching program with ID: {} from Contentful", programId);

        try {
            CDAArray result = contentfulClient.fetch(CDAEntry.class)
                    .withContentType("enrollmentProgram")
                    .where("fields.programId", programId)
                    .all();

            if (result.items().isEmpty()) {
                log.warn("Program not found with ID: {}", programId);
                return Optional.empty();
            }

            ProgramDTO program = mapToProgram((CDAEntry) result.items().get(0));
            log.info("Successfully fetched program: {}", programId);
            return Optional.of(program);

        } catch (Exception e) {
            log.error("Error fetching program {} from Contentful", programId, e);
            throw new RuntimeException("Failed to fetch program from Contentful", e);
        }
    }

    /**
     * Fetches a form schema by form ID from Contentful.
     * Results are cached to improve performance.
     *
     * @param formId the form ID
     * @return Optional containing the form schema if found
     */
    @Cacheable("contentful-forms")
    public Optional<FormSchemaDTO> getFormSchema(String formId) {
        log.info("Fetching form schema with ID: {} from Contentful", formId);

        try {
            CDAArray result = contentfulClient.fetch(CDAEntry.class)
                    .withContentType("enrollmentFormSchema")
                    .where("fields.formId", formId)
                    .all();

            if (result.items().isEmpty()) {
                log.warn("Form schema not found with ID: {}", formId);
                return Optional.empty();
            }

            FormSchemaDTO formSchema = mapToFormSchema((CDAEntry) result.items().get(0));
            log.info("Successfully fetched form schema: {}", formId);
            return Optional.of(formSchema);

        } catch (Exception e) {
            log.error("Error fetching form schema {} from Contentful", formId, e);
            throw new RuntimeException("Failed to fetch form schema from Contentful", e);
        }
    }

    /**
     * Maps a Contentful entry to a ProgramDTO.
     * Handles type casting issues (Contentful may return Double instead of
     * Integer).
     *
     * @param entry the Contentful entry
     * @return mapped ProgramDTO
     */
    private ProgramDTO mapToProgram(CDAEntry entry) {
        ProgramDTO dto = new ProgramDTO();

        try {
            dto.setProgramId(getStringField(entry, "programId"));
            dto.setDisplayName(getStringField(entry, "displayName"));
            dto.setManufacturer(getStringField(entry, "manufacturer"));
            dto.setShortDescription(getStringField(entry, "shortDescription"));
            dto.setLogoUrl(getStringField(entry, "logoUrl"));
            dto.setIsActive(getBooleanField(entry, "isActive"));

            // Extract formSchemaId from the formSchema reference field
            CDAEntry formSchemaEntry = entry.getField("formSchema");
            String formSchemaId = null;
            if (formSchemaEntry != null) {
                formSchemaId = getStringField(formSchemaEntry, "formId");
            }
            dto.setFormSchemaId(formSchemaId);

            // Branding fields
            dto.setPrimaryColor(getStringField(entry, "primaryColor"));
            dto.setPrimaryButtonColor(getStringField(entry, "primaryButtonColor"));
            dto.setSecondaryColor(getStringField(entry, "secondaryColor"));
            dto.setSecondaryButtonColor(getStringField(entry, "secondaryButtonColor"));
            dto.setHeaderBackgroundColor(getStringField(entry, "headerBackgroundColor"));
            dto.setFooterBackgroundColor(getStringField(entry, "footerBackgroundColor"));
            dto.setFormBackgroundColor(getStringField(entry, "formBackgroundColor"));
            dto.setFooterText(getStringField(entry, "footerText"));
            dto.setCompanyName(getStringField(entry, "companyName"));

            log.debug("Mapped program: {}", dto);
            return dto;

        } catch (Exception e) {
            log.error("Error mapping Contentful entry to ProgramDTO", e);
            throw new RuntimeException("Failed to map program data", e);
        }
    }

    /**
     * Maps a Contentful entry to a FormSchemaDTO.
     *
     * @param entry the Contentful entry
     * @return mapped FormSchemaDTO
     */
    private FormSchemaDTO mapToFormSchema(CDAEntry entry) {
        FormSchemaDTO dto = new FormSchemaDTO();

        try {
            dto.setFormId(getStringField(entry, "formId"));
            dto.setVersion(getStringField(entry, "version"));

            // Get the schema field and convert it to JsonNode
            Object schemaObj = entry.getField("schema");
            if (schemaObj != null) {
                JsonNode schemaNode = objectMapper.valueToTree(schemaObj);
                dto.setSchema(schemaNode);
            }

            log.debug("Mapped form schema: {}", dto);
            return dto;

        } catch (Exception e) {
            log.error("Error mapping Contentful entry to FormSchemaDTO", e);
            throw new RuntimeException("Failed to map form schema data", e);
        }
    }

    /**
     * Safely extracts a string field from a Contentful entry.
     *
     * @param entry     the Contentful entry
     * @param fieldName the field name
     * @return the field value or null if not found
     */
    private String getStringField(CDAEntry entry, String fieldName) {
        Object value = entry.getField(fieldName);
        return value != null ? value.toString() : null;
    }

    /**
     * Safely extracts a boolean field from a Contentful entry.
     *
     * @param entry     the Contentful entry
     * @param fieldName the field name
     * @return the field value or null if not found
     */
    private Boolean getBooleanField(CDAEntry entry, String fieldName) {
        Object value = entry.getField(fieldName);
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        return null;
    }

}
