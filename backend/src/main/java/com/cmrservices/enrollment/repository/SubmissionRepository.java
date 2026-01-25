package com.cmrservices.enrollment.repository;

import com.cmrservices.enrollment.model.entity.FormSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * JPA Repository for form submissions.
 * Provides database access methods for the form_submissions table.
 */
@Repository
public interface SubmissionRepository extends JpaRepository<FormSubmission, UUID> {

    /**
     * Find all submissions for a specific program.
     *
     * @param programId the program ID
     * @return list of submissions for the program
     */
    List<FormSubmission> findByProgramId(String programId);

    /**
     * Find all submissions for a specific form.
     *
     * @param formId the form ID
     * @return list of submissions for the form
     */
    List<FormSubmission> findByFormId(String formId);

    /**
     * Find all submissions for a specific program and form combination.
     *
     * @param programId the program ID
     * @param formId the form ID
     * @return list of submissions
     */
    List<FormSubmission> findByProgramIdAndFormId(String programId, String formId);
}
