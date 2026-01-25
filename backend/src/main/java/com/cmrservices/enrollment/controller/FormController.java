package com.cmrservices.enrollment.controller;

import com.cmrservices.enrollment.model.dto.FormSchemaDTO;
import com.cmrservices.enrollment.service.ContentfulService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for form schema endpoints.
 * Provides access to form configurations stored in Contentful.
 */
@RestController
@RequestMapping("/forms")
public class FormController {

    private static final Logger log = LoggerFactory.getLogger(FormController.class);

    private final ContentfulService contentfulService;

    public FormController(ContentfulService contentfulService) {
        this.contentfulService = contentfulService;
    }

    /**
     * GET /forms/{formId}
     * Returns the complete JSON schema for a form.
     *
     * @param formId the form ID
     * @return the form schema
     */
    @GetMapping("/{formId}")
    public ResponseEntity<FormSchemaDTO> getFormSchema(@PathVariable String formId) {
        log.info("Received request to get form schema: {}", formId);

        try {
            return contentfulService.getFormSchema(formId)
                    .map(schema -> {
                        log.info("Found form schema: {}", formId);
                        return ResponseEntity.ok(schema);
                    })
                    .orElseGet(() -> {
                        log.warn("Form schema not found: {}", formId);
                        return ResponseEntity.notFound().build();
                    });

        } catch (Exception e) {
            log.error("Error retrieving form schema {}", formId, e);
            throw e;
        }
    }
}
