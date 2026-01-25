package com.cmrservices.enrollment.model.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Data Transfer Object for form submission.
 * Used both for incoming submission requests and outgoing submission responses.
 */
public class SubmissionDTO {

    private UUID id;
    private String programId;
    private String formId;
    private String formType;
    private JsonNode formData;
    private String submissionStatus;
    private LocalDateTime submittedAt;
    private String submittedBy;

    // Default constructor
    public SubmissionDTO() {
    }

    // Full constructor
    public SubmissionDTO(UUID id, String programId, String formId, String formType,
                        JsonNode formData, String submissionStatus, LocalDateTime submittedAt,
                        String submittedBy) {
        this.id = id;
        this.programId = programId;
        this.formId = formId;
        this.formType = formType;
        this.formData = formData;
        this.submissionStatus = submissionStatus;
        this.submittedAt = submittedAt;
        this.submittedBy = submittedBy;
    }

    // Getters
    public UUID getId() {
        return id;
    }

    public String getProgramId() {
        return programId;
    }

    public String getFormId() {
        return formId;
    }

    public String getFormType() {
        return formType;
    }

    public JsonNode getFormData() {
        return formData;
    }

    public String getSubmissionStatus() {
        return submissionStatus;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public String getSubmittedBy() {
        return submittedBy;
    }

    // Setters
    public void setId(UUID id) {
        this.id = id;
    }

    public void setProgramId(String programId) {
        this.programId = programId;
    }

    public void setFormId(String formId) {
        this.formId = formId;
    }

    public void setFormType(String formType) {
        this.formType = formType;
    }

    public void setFormData(JsonNode formData) {
        this.formData = formData;
    }

    public void setSubmissionStatus(String submissionStatus) {
        this.submissionStatus = submissionStatus;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public void setSubmittedBy(String submittedBy) {
        this.submittedBy = submittedBy;
    }

    @Override
    public String toString() {
        return "SubmissionDTO{" +
                "id=" + id +
                ", programId='" + programId + '\'' +
                ", formId='" + formId + '\'' +
                ", formType='" + formType + '\'' +
                ", submissionStatus='" + submissionStatus + '\'' +
                ", submittedAt=" + submittedAt +
                ", submittedBy='" + submittedBy + '\'' +
                '}';
    }
}
