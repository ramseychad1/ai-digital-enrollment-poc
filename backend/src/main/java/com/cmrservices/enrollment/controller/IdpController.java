package com.cmrservices.enrollment.controller;

import com.cmrservices.enrollment.model.dto.*;
import com.cmrservices.enrollment.service.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/idp")
public class IdpController {

    private static final Logger log = LoggerFactory.getLogger(IdpController.class);

    private final PdfProcessingService pdfProcessingService;
    private final ClaudeApiService claudeApiService;
    private final GoogleAiService googleAiService;
    private final ScreenshotService screenshotService;
    private final ColorDetectionService colorDetectionService;
    private final LogoFetchService logoFetchService;
    private final ContentfulManagementService contentfulManagementService;
    private final ColorAnalysisService colorAnalysisService;
    private final ObjectMapper objectMapper;

    public IdpController(
            PdfProcessingService pdfProcessingService,
            ClaudeApiService claudeApiService,
            GoogleAiService googleAiService,
            ScreenshotService screenshotService,
            ColorDetectionService colorDetectionService,
            LogoFetchService logoFetchService,
            ContentfulManagementService contentfulManagementService,
            ColorAnalysisService colorAnalysisService,
            ObjectMapper objectMapper) {
        this.pdfProcessingService = pdfProcessingService;
        this.claudeApiService = claudeApiService;
        this.googleAiService = googleAiService;
        this.screenshotService = screenshotService;
        this.colorDetectionService = colorDetectionService;
        this.logoFetchService = logoFetchService;
        this.contentfulManagementService = contentfulManagementService;
        this.colorAnalysisService = colorAnalysisService;
        this.objectMapper = objectMapper;
    }

    /**
     * Analyze PDF and generate JSON Schema
     */
    @PostMapping(value = "/analyze-pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<JsonSchemaResponse> analyzePdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "provider", defaultValue = "claude") String provider) {
        log.info("Received PDF for analysis: {} with provider: {}", file.getOriginalFilename(), provider);

        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            if (!"application/pdf".equals(file.getContentType())) {
                log.error("Invalid file type: {}", file.getContentType());
                return ResponseEntity.badRequest().build();
            }

            // Convert PDF to images
            byte[] pdfBytes = file.getBytes();
            List<String> base64Images = pdfProcessingService.convertPdfToBase64Images(pdfBytes);

            // Send to appropriate AI provider for analysis
            String jsonSchema;
            if ("google".equalsIgnoreCase(provider)) {
                log.info("Using Google AI for PDF analysis");
                jsonSchema = googleAiService.analyzePdfAndGenerateSchema(base64Images);
            } else {
                log.info("Using Claude AI for PDF analysis");
                jsonSchema = claudeApiService.analyzePdfAndGenerateSchema(base64Images);
            }

            // Build response
            JsonSchemaResponse response = new JsonSchemaResponse();
            response.setSchema(jsonSchema);
            response.setFormId(generateFormIdFromFilename(file.getOriginalFilename()));
            response.setConfidence(85); // Placeholder
            response.setNotes(
                    "Schema generated successfully using " + provider + " AI. Please review and adjust as needed.");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error analyzing PDF", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String generateFormIdFromFilename(String filename) {
        return filename
                .toLowerCase()
                .replaceAll("\\.pdf$", "")
                .replaceAll("[^a-z0-9]+", "-");
    }

    /**
     * Capture screenshot and extract colors
     */
    @PostMapping("/capture-screenshot")
    public ResponseEntity<ColorSuggestion> captureScreenshot(@RequestBody Map<String, String> request) {
        String websiteUrl = request.get("url");

        try {
            // Capture screenshot
            String screenshotBase64 = screenshotService.captureScreenshot(websiteUrl);

            ColorSuggestion response = new ColorSuggestion();

            if (screenshotBase64 != null) {
                // Extract colors from screenshot
                byte[] imageBytes = Base64.getDecoder().decode(screenshotBase64);
                List<String> colors = colorDetectionService.extractDominantColors(imageBytes);
                response.setColors(colors);
                response.setScreenshotBase64(screenshotBase64);
            } else {
                // Screenshot failed, return default colors without screenshot
                log.info("Screenshot unavailable, returning default colors");
                List<String> defaultColors = Arrays.asList("#E41F35", "#000000", "#FFFFFF", "#0066CC", "#FF6600",
                        "#333333");
                response.setColors(defaultColors);
                response.setScreenshotBase64(null);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error in capture screenshot endpoint", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Fetch logo from Logo.dev
     */
    @PostMapping("/fetch-logo")
    public ResponseEntity<LogoResponse> fetchLogo(@RequestBody Map<String, String> request) {
        String websiteUrl = request.get("url");

        try {
            String logoUrl = logoFetchService.fetchLogo(websiteUrl);

            LogoResponse response = new LogoResponse();
            response.setFound(logoUrl != null);
            response.setLogoUrl(logoUrl);
            response.setMessage(logoUrl != null ? "Logo found" : "Logo not found");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching logo", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Analyze website colors using AI (Claude Vision)
     * Captures a screenshot of the website and uses Claude Vision to identify brand
     * colors
     */
    @PostMapping("/analyze-colors")
    public ResponseEntity<ColorAnalysisResponse> analyzeColors(@RequestBody ColorAnalysisRequest request) {
        String websiteUrl = request.getWebsiteUrl();

        if (websiteUrl == null || websiteUrl.isBlank()) {
            log.warn("analyze-colors called with null/blank websiteUrl");
            return ResponseEntity.badRequest().build();
        }

        log.info("Analyzing colors for website: {}", websiteUrl);

        try {
            ColorAnalysisResponse response = colorAnalysisService.analyzeWebsiteColors(websiteUrl);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error analyzing colors", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Analyze PDF colors using AI (Claude Vision)
     * Accepts a PDF file and uses Claude Vision to identify brand colors from the
     * document
     */
    @PostMapping(value = "/analyze-pdf-colors", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ColorAnalysisResponse> analyzePdfColors(@RequestParam("file") MultipartFile file) {
        log.info("Received PDF for color analysis: {}", file.getOriginalFilename());

        try {
            // Validate file
            if (file.isEmpty()) {
                log.warn("Empty file received for PDF color analysis");
                return ResponseEntity.badRequest().body(
                        ColorAnalysisResponse.error("Please select a PDF file to analyze"));
            }

            if (!"application/pdf".equals(file.getContentType())) {
                log.warn("Invalid file type for PDF color analysis: {}", file.getContentType());
                return ResponseEntity.badRequest().body(
                        ColorAnalysisResponse.error("Please upload a valid PDF file"));
            }

            // Convert PDF to base64
            byte[] pdfBytes = file.getBytes();
            String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);

            log.info("PDF size: {} bytes, analyzing colors...", pdfBytes.length);

            // Analyze PDF with Claude Vision
            ColorAnalysisResponse response = colorAnalysisService.analyzePdfColors(pdfBase64);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error analyzing PDF colors", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ColorAnalysisResponse.error("Failed to analyze PDF: " + e.getMessage()));
        }
    }

    /**
     * Publish program and schema to Contentful
     */
    @PostMapping("/publish-to-contentful")
    public ResponseEntity<PublishResponse> publishToContentful(@RequestBody ProgramConfigRequest config) {
        log.info("Publishing to Contentful: {}", config.getDisplayName());

        // Validate logo URL
        String logoError = validateLogoUrl(config.getLogoUrl());
        if (logoError != null) {
            log.warn("Invalid logo URL: {}", logoError);
            PublishResponse response = new PublishResponse();
            response.setSuccess(false);
            response.setMessage(logoError);
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // 1. Extract formId from the JSON schema itself (not PDF filename)
            String schemaFormId = extractFormIdFromSchema(config.getFormSchema());

            // 2. Generate program ID from display name (must be different from
            // schemaFormId)
            String programId = config.getDisplayName()
                    .toLowerCase()
                    .replaceAll("[^a-z0-9]+", "-");

            // 3. Create form schema entry using the schema's internal formId
            String formSchemaId = contentfulManagementService.createFormSchema(
                    schemaFormId,
                    "1.0",
                    config.getFormSchema());

            // 4. Create program entry
            contentfulManagementService.createProgram(
                    programId,
                    config.getDisplayName(),
                    config.getManufacturer(),
                    config.getShortDescription(),
                    config.getCompanyName(),
                    config.getFooterText(),
                    config.getPrimaryColor(),
                    config.getPrimaryButtonColor(),
                    config.getSecondaryColor(),
                    config.getSecondaryButtonColor(),
                    config.getHeaderBackgroundColor(),
                    config.getFooterBackgroundColor(),
                    config.getFormBackgroundColor(),
                    config.getLogoUrl(),
                    formSchemaId);

            PublishResponse response = new PublishResponse();
            response.setSuccess(true);
            response.setProgramId(programId);
            response.setFormSchemaId(formSchemaId);
            response.setMessage("Program published successfully");
            response.setProgramUrl("/");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error publishing to Contentful", e);

            PublishResponse response = new PublishResponse();
            response.setSuccess(false);
            response.setMessage("Failed to publish: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Update an existing program in Contentful
     */
    @PutMapping("/update-program/{programId}")
    public ResponseEntity<PublishResponse> updateProgram(
            @PathVariable String programId,
            @RequestBody Map<String, String> updateData) {
        log.info("Updating program in Contentful: {}", programId);

        // Validate logo URL
        String logoError = validateLogoUrl(updateData.get("logoUrl"));
        if (logoError != null) {
            log.warn("Invalid logo URL: {}", logoError);
            PublishResponse response = new PublishResponse();
            response.setSuccess(false);
            response.setMessage(logoError);
            return ResponseEntity.badRequest().body(response);
        }

        try {
            contentfulManagementService.updateProgram(
                    programId,
                    updateData.get("displayName"),
                    updateData.get("manufacturer"),
                    updateData.get("shortDescription"),
                    updateData.get("companyName"),
                    updateData.get("footerText"),
                    updateData.get("primaryColor"),
                    updateData.get("primaryButtonColor"),
                    updateData.get("secondaryColor"),
                    updateData.get("secondaryButtonColor"),
                    updateData.get("headerBackgroundColor"),
                    updateData.get("footerBackgroundColor"),
                    updateData.get("formBackgroundColor"),
                    updateData.get("logoUrl"));

            PublishResponse response = new PublishResponse();
            response.setSuccess(true);
            response.setProgramId(programId);
            response.setMessage("Program updated successfully");
            response.setProgramUrl("/");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error updating program in Contentful", e);

            PublishResponse response = new PublishResponse();
            response.setSuccess(false);
            response.setMessage("Failed to update: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Update an existing program with a new form schema (Edit PDF flow)
     */
    @PutMapping("/update-program-with-schema/{programId}")
    public ResponseEntity<PublishResponse> updateProgramWithSchema(
            @PathVariable String programId,
            @RequestBody ProgramConfigRequest config) {
        log.info("Updating program {} with new schema", programId);

        // Validate logo URL
        String logoError = validateLogoUrl(config.getLogoUrl());
        if (logoError != null) {
            log.warn("Invalid logo URL: {}", logoError);
            PublishResponse response = new PublishResponse();
            response.setSuccess(false);
            response.setMessage(logoError);
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // 1. Extract formId from the new JSON schema
            String schemaFormId = extractFormIdFromSchema(config.getFormSchema());

            // 2. Create new form schema entry
            String formSchemaId = contentfulManagementService.createFormSchema(
                    schemaFormId,
                    "1.0",
                    config.getFormSchema());

            // 3. Update the program with the new form schema reference
            contentfulManagementService.updateProgramWithSchema(
                    programId,
                    config.getDisplayName(),
                    config.getManufacturer(),
                    config.getShortDescription(),
                    config.getCompanyName(),
                    config.getFooterText(),
                    config.getPrimaryColor(),
                    config.getPrimaryButtonColor(),
                    config.getSecondaryColor(),
                    config.getSecondaryButtonColor(),
                    config.getHeaderBackgroundColor(),
                    config.getFooterBackgroundColor(),
                    config.getFormBackgroundColor(),
                    config.getLogoUrl(),
                    formSchemaId);

            PublishResponse response = new PublishResponse();
            response.setSuccess(true);
            response.setProgramId(programId);
            response.setFormSchemaId(formSchemaId);
            response.setMessage("Program updated with new form successfully");
            response.setProgramUrl("/");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error updating program with new schema", e);

            PublishResponse response = new PublishResponse();
            response.setSuccess(false);
            response.setMessage("Failed to update: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Validate logo URL before sending to Contentful
     * Returns error message if invalid, null if valid
     */
    private String validateLogoUrl(String logoUrl) {
        if (logoUrl == null || logoUrl.isEmpty()) {
            return null; // Empty is valid
        }

        // Check for base64 data URLs
        if (logoUrl.startsWith("data:")) {
            return "Logo URL cannot be a base64 data URL. Please use an HTTP/HTTPS URL or leave blank.";
        }

        // Check length (Contentful Symbol field max is 255 characters)
        if (logoUrl.length() > 255) {
            return "Logo URL is too long (maximum 255 characters). Please use a shorter URL.";
        }

        return null; // Valid
    }

    /**
     * Extract formId from the JSON schema's x-form-config section
     * Falls back to generating an ID from the schema title if not found
     */
    private String extractFormIdFromSchema(String schemaJson) {
        if (schemaJson == null || schemaJson.isEmpty()) {
            log.warn("Schema JSON is null or empty, using default formId");
            return "form-schema-" + System.currentTimeMillis();
        }

        try {
            JsonNode root = objectMapper.readTree(schemaJson);

            // First, try to get formId from x-form-config
            JsonNode formConfig = root.path("x-form-config");
            if (!formConfig.isMissingNode()) {
                String formId = formConfig.path("formId").asText();
                if (formId != null && !formId.isEmpty()) {
                    log.info("Found formId in x-form-config: {}", formId);
                    return formId;
                }
            }

            // Fallback: try to generate from schema title
            String title = root.path("title").asText();
            if (title != null && !title.isEmpty()) {
                String generatedId = title.toLowerCase().replaceAll("[^a-z0-9]+", "-");
                log.info("Generated formId from title: {}", generatedId);
                return generatedId;
            }

            // Final fallback: use timestamp-based ID
            String fallbackId = "form-schema-" + System.currentTimeMillis();
            log.warn("No formId or title found in schema, using generated ID: {}", fallbackId);
            return fallbackId;

        } catch (Exception e) {
            log.error("Error extracting formId from schema: {}", e.getMessage());
            String fallbackId = "form-schema-" + System.currentTimeMillis();
            log.info("Using fallback formId: {}", fallbackId);
            return fallbackId;
        }
    }
}
