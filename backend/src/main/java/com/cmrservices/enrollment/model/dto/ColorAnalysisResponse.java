package com.cmrservices.enrollment.model.dto;

import java.util.List;

public class ColorAnalysisResponse {

    private List<String> colors;
    private String screenshotBase64;
    private String reasoning;
    private boolean success;
    private String errorMessage;
    private boolean websiteBlocked;

    public ColorAnalysisResponse() {
    }

    public ColorAnalysisResponse(List<String> colors) {
        this.colors = colors;
        this.success = true;
    }

    public ColorAnalysisResponse(List<String> colors, String screenshotBase64, String reasoning) {
        this.colors = colors;
        this.screenshotBase64 = screenshotBase64;
        this.reasoning = reasoning;
        this.success = true;
    }

    // Factory method for successful analysis
    public static ColorAnalysisResponse success(List<String> colors, String reasoning) {
        ColorAnalysisResponse response = new ColorAnalysisResponse();
        response.colors = colors;
        response.reasoning = reasoning;
        response.success = true;
        response.websiteBlocked = false;
        return response;
    }

    // Factory method for blocked website
    public static ColorAnalysisResponse blocked(String errorMessage) {
        ColorAnalysisResponse response = new ColorAnalysisResponse();
        response.success = false;
        response.websiteBlocked = true;
        response.errorMessage = errorMessage;
        return response;
    }

    // Factory method for general error
    public static ColorAnalysisResponse error(String errorMessage) {
        ColorAnalysisResponse response = new ColorAnalysisResponse();
        response.success = false;
        response.websiteBlocked = false;
        response.errorMessage = errorMessage;
        return response;
    }

    public List<String> getColors() {
        return colors;
    }

    public void setColors(List<String> colors) {
        this.colors = colors;
    }

    public String getScreenshotBase64() {
        return screenshotBase64;
    }

    public void setScreenshotBase64(String screenshotBase64) {
        this.screenshotBase64 = screenshotBase64;
    }

    public String getReasoning() {
        return reasoning;
    }

    public void setReasoning(String reasoning) {
        this.reasoning = reasoning;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public boolean isWebsiteBlocked() {
        return websiteBlocked;
    }

    public void setWebsiteBlocked(boolean websiteBlocked) {
        this.websiteBlocked = websiteBlocked;
    }
}
