package com.cmrservices.enrollment.service;

import com.cmrservices.enrollment.model.dto.ColorAnalysisResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for analyzing colors from websites and PDFs using Claude Vision.
 * Uses visual analysis to accurately identify brand colors from screenshots and
 * documents.
 */
@Service
public class ColorAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(ColorAnalysisService.class);

    @Value("${claude.api-key}")
    private String apiKey;

    @Value("${claude.api-url}")
    private String apiUrl;

    @Value("${claude.model}")
    private String model;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final ScreenshotService screenshotService;

    public ColorAnalysisService(
            WebClient.Builder webClientBuilder,
            ObjectMapper objectMapper,
            ScreenshotService screenshotService) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
        this.screenshotService = screenshotService;
    }

    /**
     * Analyze a website by capturing a screenshot and using Claude Vision
     * to identify brand colors.
     */
    public ColorAnalysisResponse analyzeWebsiteColors(String websiteUrl) {
        log.info("Analyzing website colors for: {}", websiteUrl);

        try {
            // Check if screenshot service is ready
            if (!screenshotService.isReady()) {
                log.error("Screenshot service not ready");
                return ColorAnalysisResponse.error(
                        "Screenshot service is not available. Please try using the 'Analyze PDF' feature instead.");
            }

            // Capture screenshot
            String screenshotBase64 = screenshotService.captureScreenshot(websiteUrl);

            if (screenshotBase64 == null || screenshotBase64.isEmpty()) {
                log.warn("Failed to capture screenshot for {}", websiteUrl);
                return ColorAnalysisResponse.blocked(
                        "Unable to capture screenshot of the website. The site may be blocking automated access. " +
                                "Please try using the 'Analyze PDF' feature to extract colors from a PDF document instead.");
            }

            // Analyze screenshot with Claude Vision
            return analyzeImageWithVision(screenshotBase64, "image/png", "website screenshot");

        } catch (Exception e) {
            log.error("Error analyzing website colors: {}", e.getMessage(), e);
            return ColorAnalysisResponse.error(
                    "An error occurred while analyzing the website: " + e.getMessage() + ". " +
                            "Please try using the 'Analyze PDF' feature instead.");
        }
    }

    /**
     * Analyze a PDF document using Claude Vision to identify brand colors.
     * 
     * @param pdfBase64 Base64 encoded PDF content
     * @return ColorAnalysisResponse with extracted colors
     */
    public ColorAnalysisResponse analyzePdfColors(String pdfBase64) {
        log.info("Analyzing PDF colors using Claude Vision");

        try {
            if (pdfBase64 == null || pdfBase64.isEmpty()) {
                return ColorAnalysisResponse.error("PDF content is empty");
            }

            // Analyze PDF with Claude Vision
            return analyzeDocumentWithVision(pdfBase64, "application/pdf", "PDF document");

        } catch (Exception e) {
            log.error("Error analyzing PDF colors: {}", e.getMessage(), e);
            return ColorAnalysisResponse.error(
                    "An error occurred while analyzing the PDF: " + e.getMessage());
        }
    }

    /**
     * Analyze an image (screenshot) with Claude Vision API
     */
    private ColorAnalysisResponse analyzeImageWithVision(String imageBase64, String mediaType,
            String sourceDescription) {
        log.info("Analyzing {} with Claude Vision", sourceDescription);

        try {
            String prompt = buildVisionPrompt(sourceDescription);

            // Build Claude Vision API request with image
            Map<String, Object> requestBody = buildVisionImageRequest(imageBase64, mediaType, prompt);

            // Call Claude API
            String response = callClaudeApi(requestBody);

            // Parse response
            return parseVisionResponse(response);

        } catch (Exception e) {
            log.error("Error in Claude Vision analysis: {}", e.getMessage(), e);
            return ColorAnalysisResponse.error("Failed to analyze " + sourceDescription + ": " + e.getMessage());
        }
    }

    /**
     * Analyze a PDF document with Claude Vision API
     */
    private ColorAnalysisResponse analyzeDocumentWithVision(String documentBase64, String mediaType,
            String sourceDescription) {
        log.info("Analyzing {} with Claude Vision", sourceDescription);

        try {
            String prompt = buildVisionPrompt(sourceDescription);

            // Build Claude Vision API request with document
            Map<String, Object> requestBody = buildVisionDocumentRequest(documentBase64, mediaType, prompt);

            // Call Claude API
            String response = callClaudeApi(requestBody);

            // Parse response
            return parseVisionResponse(response);

        } catch (Exception e) {
            log.error("Error in Claude Vision analysis: {}", e.getMessage(), e);
            return ColorAnalysisResponse.error("Failed to analyze " + sourceDescription + ": " + e.getMessage());
        }
    }

    /**
     * Build the Claude Vision prompt for color extraction
     */
    private String buildVisionPrompt(String sourceDescription) {
        return """
                You are analyzing a %s from a pharmaceutical company to extract brand colors for a patient enrollment form.

                Please carefully examine the visual content and identify the following colors:

                1. **Primary Button Color** - The main call-to-action button color (often green, blue, or a brand accent color)
                2. **Header Background Color** - The color used in the header/navigation bar
                3. **Footer Background Color** - The color used in the footer area (often matches header or is darker)
                4. **Accent/Highlight Color** - Used for links, highlights, and decorative elements
                5. **Secondary Button Color** - Less prominent buttons, often gray or muted
                6. **Sidebar/Navigation Color** - Background color for sidebars or secondary navigation

                IMPORTANT:
                - Extract the ACTUAL colors you see in the image, not generic defaults
                - Look for prominent brand colors, buttons, headers, and UI elements
                - Pay special attention to CTA buttons - they often use the primary brand color
                - Ensure colors provide good contrast for accessibility

                Return ONLY a valid JSON object with hex color values, no additional text:
                {
                  "primaryButton": "#RRGGBB",
                  "header": "#RRGGBB",
                  "footer": "#RRGGBB",
                  "accent": "#RRGGBB",
                  "secondaryButton": "#RRGGBB",
                  "sidebar": "#RRGGBB"
                }
                """
                .formatted(sourceDescription);
    }

    /**
     * Build Claude Vision API request body for image analysis
     */
    private Map<String, Object> buildVisionImageRequest(String imageBase64, String mediaType, String prompt) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("max_tokens", 500);

        // Build content array with image and text
        List<Map<String, Object>> content = new ArrayList<>();

        // Add image content
        Map<String, Object> imageContent = new HashMap<>();
        imageContent.put("type", "image");
        Map<String, Object> imageSource = new HashMap<>();
        imageSource.put("type", "base64");
        imageSource.put("media_type", mediaType);
        imageSource.put("data", imageBase64);
        imageContent.put("source", imageSource);
        content.add(imageContent);

        // Add text prompt
        Map<String, Object> textContent = new HashMap<>();
        textContent.put("type", "text");
        textContent.put("text", prompt);
        content.add(textContent);

        // Build message
        List<Map<String, Object>> messages = new ArrayList<>();
        Map<String, Object> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", content);
        messages.add(userMessage);

        requestBody.put("messages", messages);

        return requestBody;
    }

    /**
     * Build Claude Vision API request body for document (PDF) analysis
     */
    private Map<String, Object> buildVisionDocumentRequest(String documentBase64, String mediaType, String prompt) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("max_tokens", 500);

        // Build content array with document and text
        List<Map<String, Object>> content = new ArrayList<>();

        // Add document content
        Map<String, Object> documentContent = new HashMap<>();
        documentContent.put("type", "document");
        Map<String, Object> documentSource = new HashMap<>();
        documentSource.put("type", "base64");
        documentSource.put("media_type", mediaType);
        documentSource.put("data", documentBase64);
        documentContent.put("source", documentSource);
        content.add(documentContent);

        // Add text prompt
        Map<String, Object> textContent = new HashMap<>();
        textContent.put("type", "text");
        textContent.put("text", prompt);
        content.add(textContent);

        // Build message
        List<Map<String, Object>> messages = new ArrayList<>();
        Map<String, Object> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", content);
        messages.add(userMessage);

        requestBody.put("messages", messages);

        return requestBody;
    }

    /**
     * Call Claude API with the request body
     */
    private String callClaudeApi(Map<String, Object> requestBody) throws Exception {
        log.info("Calling Claude Vision API");

        String response = webClient.post()
                .uri(java.util.Objects.requireNonNull(apiUrl, "API URL must not be null"))
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .bodyValue(java.util.Objects.requireNonNull(requestBody, "Request body must not be null"))
                .retrieve()
                .bodyToMono(String.class)
                .timeout(Duration.ofSeconds(90)) // Longer timeout for vision
                .block();

        if (response == null) {
            throw new RuntimeException("Received null response from Claude Vision API");
        }

        log.info("Received response from Claude Vision API");
        return response;
    }

    /**
     * Parse Claude Vision response and extract colors
     */
    private ColorAnalysisResponse parseVisionResponse(String response) {
        List<String> colors = new ArrayList<>();

        try {
            JsonNode responseNode = objectMapper.readTree(response);
            String content = responseNode
                    .path("content")
                    .get(0)
                    .path("text")
                    .asText();

            log.debug("Claude Vision raw response: {}", content);

            // Extract JSON from anywhere in the response
            String jsonContent = extractJsonFromResponse(content);

            if (jsonContent == null) {
                log.error("Could not find JSON object in Claude response");
                return ColorAnalysisResponse.error("Could not parse color data from AI response");
            }

            log.debug("Extracted JSON: {}", jsonContent);

            // Parse the JSON
            JsonNode colorsNode = objectMapper.readTree(jsonContent);

            // Extract colors in order
            String[] keys = { "primaryButton", "header", "footer", "accent", "secondaryButton", "sidebar" };
            for (String key : keys) {
                if (colorsNode.has(key)) {
                    String color = colorsNode.get(key).asText();
                    // Ensure it starts with #
                    if (!color.startsWith("#")) {
                        color = "#" + color;
                    }
                    colors.add(color.toUpperCase());
                }
            }

            log.info("Parsed {} colors from Claude Vision response: {}", colors.size(), colors);

            if (colors.size() >= 6) {
                return ColorAnalysisResponse.success(colors, "AI-analyzed brand colors from visual content");
            } else {
                log.warn("Claude Vision returned insufficient colors ({})", colors.size());
                return ColorAnalysisResponse.error(
                        "Unable to determine all brand colors from the visual content. " +
                                "Please manually select colors or try a different source.");
            }

        } catch (Exception e) {
            log.error("Error parsing Claude Vision response: {}", e.getMessage());
            return ColorAnalysisResponse.error("Failed to parse color analysis results: " + e.getMessage());
        }
    }

    /**
     * Extract JSON object from Claude's response, handling cases where
     * there's explanatory text before/after the JSON
     */
    private String extractJsonFromResponse(String content) {
        if (content == null || content.isEmpty()) {
            return null;
        }

        // First, try to find JSON in a code block
        int jsonBlockStart = content.indexOf("```json");
        if (jsonBlockStart != -1) {
            int jsonStart = jsonBlockStart + 7;
            int jsonEnd = content.indexOf("```", jsonStart);
            if (jsonEnd != -1) {
                return content.substring(jsonStart, jsonEnd).trim();
            }
        }

        // Try generic code block
        int codeBlockStart = content.indexOf("```");
        if (codeBlockStart != -1) {
            int jsonStart = codeBlockStart + 3;
            // Skip any language identifier on the same line
            int lineEnd = content.indexOf('\n', jsonStart);
            if (lineEnd != -1) {
                jsonStart = lineEnd + 1;
            }
            int jsonEnd = content.indexOf("```", jsonStart);
            if (jsonEnd != -1) {
                return content.substring(jsonStart, jsonEnd).trim();
            }
        }

        // Try to find a JSON object directly (starts with { and ends with })
        int braceStart = content.indexOf('{');
        if (braceStart != -1) {
            int braceEnd = content.lastIndexOf('}');
            if (braceEnd > braceStart) {
                return content.substring(braceStart, braceEnd + 1).trim();
            }
        }

        // If nothing found, return the original content trimmed
        return content.trim();
    }
}
