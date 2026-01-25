package com.cmrservices.enrollment.model.dto;

public class ColorAnalysisRequest {

    private String websiteUrl;

    public ColorAnalysisRequest() {
    }

    public ColorAnalysisRequest(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }
}
