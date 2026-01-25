package com.cmrservices.enrollment.model.dto;

public class JsonSchemaResponse {
    private String schema;
    private String formId;
    private int confidence;
    private String notes;

    // Manual getters and setters (NO LOMBOK)
    public String getSchema() {
        return schema;
    }

    public void setSchema(String schema) {
        this.schema = schema;
    }

    public String getFormId() {
        return formId;
    }

    public void setFormId(String formId) {
        this.formId = formId;
    }

    public int getConfidence() {
        return confidence;
    }

    public void setConfidence(int confidence) {
        this.confidence = confidence;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
