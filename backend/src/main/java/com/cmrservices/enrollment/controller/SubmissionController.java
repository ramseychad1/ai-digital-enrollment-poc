package com.cmrservices.enrollment.controller;

import com.cmrservices.enrollment.model.dto.SubmissionDTO;
import com.cmrservices.enrollment.service.SubmissionService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for form submission endpoints.
 * Handles saving and retrieving form submissions.
 */
@RestController
@RequestMapping("/submissions")
public class SubmissionController {

    private static final Logger log = LoggerFactory.getLogger(SubmissionController.class);

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    /**
     * POST /submissions
     * Saves a form submission to the database.
     *
     * @param submissionDTO the submission data
     * @return the saved submission with ID and status
     */
    @PostMapping
    public ResponseEntity<SubmissionDTO> createSubmission(@Valid @RequestBody SubmissionDTO submissionDTO) {
        log.info("Received submission for program: {}, form: {}",
                submissionDTO.getProgramId(), submissionDTO.getFormId());

        try {
            SubmissionDTO savedSubmission = submissionService.saveSubmission(submissionDTO);
            log.info("Successfully saved submission with ID: {}", savedSubmission.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedSubmission);

        } catch (Exception e) {
            log.error("Error saving submission", e);
            throw e;
        }
    }

    /**
     * GET /submissions/{id}
     * Retrieves a specific submission by ID.
     *
     * @param id the submission ID
     * @return the submission
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubmissionDTO> getSubmissionById(@PathVariable UUID id) {
        log.info("Received request to get submission: {}", id);

        try {
            return submissionService.getSubmissionById(id)
                    .map(submission -> {
                        log.info("Found submission: {}", id);
                        return ResponseEntity.ok(submission);
                    })
                    .orElseGet(() -> {
                        log.warn("Submission not found: {}", id);
                        return ResponseEntity.notFound().build();
                    });

        } catch (Exception e) {
            log.error("Error retrieving submission {}", id, e);
            throw e;
        }
    }
}
