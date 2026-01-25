package com.cmrservices.enrollment.model.dto;

import java.util.List;

public class ColorSuggestion {
    private List<String> colors; // Hex color strings
    private String screenshotBase64;

    // Getters and Setters
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
}
