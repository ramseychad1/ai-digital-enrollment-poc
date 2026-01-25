package com.cmrservices.enrollment.model.dto;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Data Transfer Object for form schema configuration.
 * This represents the complete JSON Schema for a form, including all field definitions,
 * validation rules, and layout configuration.
 */
public class FormSchemaDTO {

    private String formId;
    private String version;
    private JsonNode schema;

    // Default constructor
    public FormSchemaDTO() {
    }

    // Full constructor
    public FormSchemaDTO(String formId, String version, JsonNode schema) {
        this.formId = formId;
        this.version = version;
        this.schema = schema;
    }

    // Getters
    public String getFormId() {
        return formId;
    }

    public String getVersion() {
        return version;
    }

    public JsonNode getSchema() {
        return schema;
    }

    // Setters
    public void setFormId(String formId) {
        this.formId = formId;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public void setSchema(JsonNode schema) {
        this.schema = schema;
    }

    @Override
    public String toString() {
        return "FormSchemaDTO{" +
                "formId='" + formId + '\'' +
                ", version='" + version + '\'' +
                ", schema=" + (schema != null ? "present" : "null") +
                '}';
    }
}
