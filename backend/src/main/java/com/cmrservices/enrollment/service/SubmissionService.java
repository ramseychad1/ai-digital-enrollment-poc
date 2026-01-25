package com.cmrservices.enrollment.service;

import com.cmrservices.enrollment.model.dto.SubmissionDTO;
import com.cmrservices.enrollment.model.entity.FormSubmission;
import com.cmrservices.enrollment.repository.SubmissionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing form submissions.
 * Handles saving submissions to the database and retrieving them.
 */
@Service
public class SubmissionService {

    private static final Logger log = LoggerFactory.getLogger(SubmissionService.class);

    private final SubmissionRepository submissionRepository;
    private final ObjectMapper objectMapper;

    public SubmissionService(SubmissionRepository submissionRepository) {
        this.submissionRepository = submissionRepository;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Saves a form submission to the database.
     *
     * @param submissionDTO the submission data
     * @return the saved submission with generated ID
     */
    @Transactional
    public SubmissionDTO saveSubmission(SubmissionDTO submissionDTO) {
        log.info("Saving form submission for program: {}, form: {}",
                submissionDTO.getProgramId(), submissionDTO.getFormId());

        try {
            // Convert form data to JSON string
            String jsonData = objectMapper.writeValueAsString(submissionDTO.getFormData());

            // Create entity
            FormSubmission entity = new FormSubmission();
            entity.setProgramId(submissionDTO.getProgramId());
            entity.setFormId(submissionDTO.getFormId());
            entity.setFormType(submissionDTO.getFormType());
            entity.setSubmissionData(jsonData);
            entity.setSubmissionStatus("submitted");
            entity.setSubmittedAt(LocalDateTime.now());
            entity.setSubmittedBy(submissionDTO.getSubmittedBy());

            // Save to database
            FormSubmission savedEntity = submissionRepository.save(entity);

            log.info("Successfully saved submission with ID: {}", savedEntity.getId());

            // Convert back to DTO
            return mapToDTO(savedEntity);

        } catch (JsonProcessingException e) {
            log.error("Error converting form data to JSON", e);
            throw new RuntimeException("Failed to process form data", e);
        } catch (Exception e) {
            log.error("Error saving form submission", e);
            throw new RuntimeException("Failed to save form submission", e);
        }
    }

    /**
     * Retrieves a submission by ID.
     *
     * @param id the submission ID
     * @return Optional containing the submission if found
     */
    public Optional<SubmissionDTO> getSubmissionById(UUID id) {
        log.debug("Fetching submission with ID: {}", id);

        return submissionRepository.findById(id)
                .map(this::mapToDTO);
    }

    /**
     * Retrieves all submissions for a specific program.
     *
     * @param programId the program ID
     * @return list of submissions
     */
    public List<SubmissionDTO> getSubmissionsByProgramId(String programId) {
        log.debug("Fetching submissions for program: {}", programId);

        return submissionRepository.findByProgramId(programId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all submissions for a specific form.
     *
     * @param formId the form ID
     * @return list of submissions
     */
    public List<SubmissionDTO> getSubmissionsByFormId(String formId) {
        log.debug("Fetching submissions for form: {}", formId);

        return submissionRepository.findByFormId(formId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Maps a FormSubmission entity to a SubmissionDTO.
     *
     * @param entity the entity
     * @return the DTO
     */
    private SubmissionDTO mapToDTO(FormSubmission entity) {
        try {
            SubmissionDTO dto = new SubmissionDTO();
            dto.setId(entity.getId());
            dto.setProgramId(entity.getProgramId());
            dto.setFormId(entity.getFormId());
            dto.setFormType(entity.getFormType());
            dto.setSubmissionStatus(entity.getSubmissionStatus());
            dto.setSubmittedAt(entity.getSubmittedAt());
            dto.setSubmittedBy(entity.getSubmittedBy());

            // Parse JSON string back to JsonNode
            if (entity.getSubmissionData() != null) {
                dto.setFormData(objectMapper.readTree(entity.getSubmissionData()));
            }

            return dto;

        } catch (JsonProcessingException e) {
            log.error("Error parsing submission data JSON", e);
            throw new RuntimeException("Failed to parse submission data", e);
        }
    }
}
