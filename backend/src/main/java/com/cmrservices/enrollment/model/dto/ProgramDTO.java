package com.cmrservices.enrollment.model.dto;

/**
 * Data Transfer Object for enrollment program information.
 * This represents a pharmaceutical enrollment program (e.g., Kisunla - Lilly).
 */
public class ProgramDTO {

    private String programId;
    private String displayName;
    private String manufacturer;
    private String shortDescription;
    private String logoUrl;
    private Boolean isActive;
    private String formSchemaId;

    // Branding fields
    private String primaryColor;
    private String primaryButtonColor;
    private String secondaryColor;
    private String secondaryButtonColor;
    private String headerBackgroundColor;
    private String footerBackgroundColor;
    private String formBackgroundColor;
    private String footerText;
    private String companyName;

    // Default constructor
    public ProgramDTO() {
    }

    // Full constructor
    public ProgramDTO(String programId, String displayName, String manufacturer,
                      String shortDescription, String logoUrl, Boolean isActive,
                      String formSchemaId) {
        this.programId = programId;
        this.displayName = displayName;
        this.manufacturer = manufacturer;
        this.shortDescription = shortDescription;
        this.logoUrl = logoUrl;
        this.isActive = isActive;
        this.formSchemaId = formSchemaId;
    }

    // Getters
    public String getProgramId() {
        return programId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public String getFormSchemaId() {
        return formSchemaId;
    }

    public String getPrimaryColor() {
        return primaryColor;
    }

    public String getPrimaryButtonColor() {
        return primaryButtonColor;
    }

    public String getSecondaryColor() {
        return secondaryColor;
    }

    public String getSecondaryButtonColor() {
        return secondaryButtonColor;
    }

    public String getHeaderBackgroundColor() {
        return headerBackgroundColor;
    }

    public String getFooterBackgroundColor() {
        return footerBackgroundColor;
    }

    public String getFormBackgroundColor() {
        return formBackgroundColor;
    }

    public String getFooterText() {
        return footerText;
    }

    public String getCompanyName() {
        return companyName;
    }

    // Setters
    public void setProgramId(String programId) {
        this.programId = programId;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public void setFormSchemaId(String formSchemaId) {
        this.formSchemaId = formSchemaId;
    }

    public void setPrimaryColor(String primaryColor) {
        this.primaryColor = primaryColor;
    }

    public void setPrimaryButtonColor(String primaryButtonColor) {
        this.primaryButtonColor = primaryButtonColor;
    }

    public void setSecondaryColor(String secondaryColor) {
        this.secondaryColor = secondaryColor;
    }

    public void setSecondaryButtonColor(String secondaryButtonColor) {
        this.secondaryButtonColor = secondaryButtonColor;
    }

    public void setHeaderBackgroundColor(String headerBackgroundColor) {
        this.headerBackgroundColor = headerBackgroundColor;
    }

    public void setFooterBackgroundColor(String footerBackgroundColor) {
        this.footerBackgroundColor = footerBackgroundColor;
    }

    public void setFormBackgroundColor(String formBackgroundColor) {
        this.formBackgroundColor = formBackgroundColor;
    }

    public void setFooterText(String footerText) {
        this.footerText = footerText;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    @Override
    public String toString() {
        return "ProgramDTO{" +
                "programId='" + programId + '\'' +
                ", displayName='" + displayName + '\'' +
                ", manufacturer='" + manufacturer + '\'' +
                ", shortDescription='" + shortDescription + '\'' +
                ", logoUrl='" + logoUrl + '\'' +
                ", isActive=" + isActive +
                ", formSchemaId='" + formSchemaId + '\'' +
                ", primaryColor='" + primaryColor + '\'' +
                ", primaryButtonColor='" + primaryButtonColor + '\'' +
                ", secondaryColor='" + secondaryColor + '\'' +
                ", secondaryButtonColor='" + secondaryButtonColor + '\'' +
                ", headerBackgroundColor='" + headerBackgroundColor + '\'' +
                ", footerBackgroundColor='" + footerBackgroundColor + '\'' +
                ", formBackgroundColor='" + formBackgroundColor + '\'' +
                ", footerText='" + footerText + '\'' +
                ", companyName='" + companyName + '\'' +
                '}';
    }
}
