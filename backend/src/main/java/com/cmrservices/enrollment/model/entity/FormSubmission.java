package com.cmrservices.enrollment.model.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * JPA Entity for form submissions stored in Supabase PostgreSQL.
 * Maps to the form_submissions table.
 */
@Entity
@Table(name = "form_submissions")
public class FormSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "program_id", nullable = false)
    private String programId;

    @Column(name = "form_id", nullable = false)
    private String formId;

    @Column(name = "form_type")
    private String formType;

    @Column(name = "submission_data", columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    private String submissionData;

    @Column(name = "submission_status")
    private String submissionStatus = "submitted";

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "submitted_by")
    private String submittedBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Default constructor
    public FormSubmission() {
    }

    // Full constructor
    public FormSubmission(UUID id, String programId, String formId, String formType,
                         String submissionData, String submissionStatus,
                         LocalDateTime submittedAt, String submittedBy,
                         LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.programId = programId;
        this.formId = formId;
        this.formType = formType;
        this.submissionData = submissionData;
        this.submissionStatus = submissionStatus;
        this.submittedAt = submittedAt;
        this.submittedBy = submittedBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    /**
     * JPA lifecycle callback to set timestamps before persisting.
     */
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.submittedAt == null) {
            this.submittedAt = now;
        }
        if (this.submissionStatus == null) {
            this.submissionStatus = "submitted";
        }
    }

    /**
     * JPA lifecycle callback to update timestamp before updating.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
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

    public String getSubmissionData() {
        return submissionData;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
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

    public void setSubmissionData(String submissionData) {
        this.submissionData = submissionData;
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

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "FormSubmission{" +
                "id=" + id +
                ", programId='" + programId + '\'' +
                ", formId='" + formId + '\'' +
                ", formType='" + formType + '\'' +
                ", submissionStatus='" + submissionStatus + '\'' +
                ", submittedAt=" + submittedAt +
                ", submittedBy='" + submittedBy + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
