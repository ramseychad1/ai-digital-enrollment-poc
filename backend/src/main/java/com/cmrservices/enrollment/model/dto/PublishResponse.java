package com.cmrservices.enrollment.model.dto;

public class PublishResponse {
    private boolean success;
    private String programId;
    private String formSchemaId;
    private String message;
    private String programUrl;

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getProgramId() {
        return programId;
    }

    public void setProgramId(String programId) {
        this.programId = programId;
    }

    public String getFormSchemaId() {
        return formSchemaId;
    }

    public void setFormSchemaId(String formSchemaId) {
        this.formSchemaId = formSchemaId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getProgramUrl() {
        return programUrl;
    }

    public void setProgramUrl(String programUrl) {
        this.programUrl = programUrl;
    }
}
