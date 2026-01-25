package com.cmrservices.enrollment.model.dto;

public class PdfAnalysisRequest {
    private String fileName;
    private String base64Content;

    // Manual getters and setters (NO LOMBOK)
    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getBase64Content() {
        return base64Content;
    }

    public void setBase64Content(String base64Content) {
        this.base64Content = base64Content;
    }
}
