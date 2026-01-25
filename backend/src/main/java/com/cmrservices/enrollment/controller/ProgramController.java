package com.cmrservices.enrollment.controller;

import com.cmrservices.enrollment.model.dto.ProgramDTO;
import com.cmrservices.enrollment.service.ContentfulService;
import com.cmrservices.enrollment.service.ContentfulManagementService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for enrollment program endpoints.
 * Provides access to program information stored in Contentful.
 */
@RestController
@RequestMapping("/programs")
public class ProgramController {

    private static final Logger log = LoggerFactory.getLogger(ProgramController.class);

    private final ContentfulService contentfulService;
    private final ContentfulManagementService contentfulManagementService;

    public ProgramController(ContentfulService contentfulService, ContentfulManagementService contentfulManagementService) {
        this.contentfulService = contentfulService;
        this.contentfulManagementService = contentfulManagementService;
    }

    /**
     * GET /programs
     * Returns all active enrollment programs.
     *
     * @return list of active programs
     */
    @GetMapping
    public ResponseEntity<List<ProgramDTO>> getAllPrograms() {
        log.info("Received request to get all programs");

        try {
            List<ProgramDTO> programs = contentfulService.getAllPrograms();
            log.info("Returning {} programs", programs.size());
            return ResponseEntity.ok(programs);

        } catch (Exception e) {
            log.error("Error retrieving programs", e);
            throw e;
        }
    }

    /**
     * GET /programs/{programId}
     * Returns a specific program with its form schema reference.
     *
     * @param programId the program ID
     * @return the program details
     */
    @GetMapping("/{programId}")
    public ResponseEntity<ProgramDTO> getProgramById(@PathVariable String programId) {
        log.info("Received request to get program: {}", programId);

        try {
            return contentfulService.getProgramById(programId)
                    .map(program -> {
                        log.info("Found program: {}", programId);
                        return ResponseEntity.ok(program);
                    })
                    .orElseGet(() -> {
                        log.warn("Program not found: {}", programId);
                        return ResponseEntity.notFound().build();
                    });

        } catch (Exception e) {
            log.error("Error retrieving program {}", programId, e);
            throw e;
        }
    }

    /**
     * DELETE /programs/{programId}
     * Deletes a program from Contentful.
     *
     * @param programId the program ID
     * @return empty response on success
     */
    @DeleteMapping("/{programId}")
    public ResponseEntity<Void> deleteProgram(@PathVariable String programId) {
        log.info("Received request to delete program: {}", programId);

        try {
            contentfulManagementService.deleteProgram(programId);
            log.info("Successfully deleted program: {}", programId);
            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            log.error("Error deleting program {}", programId, e);
            throw e;
        }
    }
}
