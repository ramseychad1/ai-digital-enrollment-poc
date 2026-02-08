package com.cmrservices.enrollment.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ClaudeApiService {

  private static final Logger log = LoggerFactory.getLogger(ClaudeApiService.class);

  @Value("${claude.api-key}")
  private String apiKey;

  @Value("${claude.api-url}")
  private String apiUrl;

  @Value("${claude.model}")
  private String model;

  @Value("${claude.max-tokens}")
  private int maxTokens;

  private final WebClient webClient;
  private final ObjectMapper objectMapper;

  public ClaudeApiService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
    this.webClient = webClientBuilder.build();
    this.objectMapper = objectMapper;
  }

  /**
   * Analyze PDF and generate JSON Schema
   */
  public String analyzePdfAndGenerateSchema(List<String> base64Images) {
    log.info("Sending {} PDF pages to Claude API for analysis", base64Images.size());

    try {
      // Build the message content with images
      List<Map<String, Object>> content = new ArrayList<>();

      // Add the system prompt
      content.add(Map.of(
          "type", "text",
          "text", buildAnalysisPrompt()));

      // Calculate approximate payload size
      long totalImageSize = base64Images.stream()
          .mapToLong(String::length)
          .sum();
      double payloadSizeMB = totalImageSize / (1024.0 * 1024.0);
      log.info("Estimated payload size: {} MB ({} pages)", String.format("%.2f", payloadSizeMB), base64Images.size());

      if (payloadSizeMB > 10) {
        log.warn("Large payload detected ({} MB) - may cause connection issues or timeouts",
            String.format("%.2f", payloadSizeMB));
      }

      // Add each PDF page as an image
      for (int i = 0; i < base64Images.size(); i++) {
        content.add(Map.of(
            "type", "image",
            "source", Map.of(
                "type", "base64",
                "media_type", "image/png",
                "data", base64Images.get(i))));
      }

      // Build the request body
      Map<String, Object> requestBody = new HashMap<>();
      requestBody.put("model", model);
      requestBody.put("max_tokens", maxTokens);
      requestBody.put("messages", List.of(
          Map.of("role", "user", "content", content)));

      // Call Claude API with retry logic
      String response = callClaudeApiWithRetry(requestBody);

      // Parse response and extract JSON schema
      JsonNode responseNode = objectMapper.readTree(response);
      String generatedSchema = responseNode
          .path("content")
          .get(0)
          .path("text")
          .asText();

      // Strip markdown code fences if present
      generatedSchema = stripMarkdownCodeFence(generatedSchema);

      // Validate and attempt to fix common JSON issues
      generatedSchema = validateAndFixJson(generatedSchema);

      log.info("Successfully received schema from Claude API");
      return generatedSchema;

    } catch (Exception e) {
      log.error("Error calling Claude API", e);
      if (e.getCause() != null && e.getCause() instanceof java.net.SocketException) {
        throw new RuntimeException(
            "Connection reset by Claude API - PDF may be too large or network is unstable. Try a smaller PDF.", e);
      }
      throw new RuntimeException("Failed to analyze PDF with Claude API", e);
    }
  }

  /**
   * Call Claude API with retry logic for connection errors
   */
  private String callClaudeApiWithRetry(Map<String, Object> requestBody) {
    int maxRetries = 2;
    int retryDelayMs = 2000;

    for (int attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        log.info("Calling Claude API (attempt {}/{})", attempt, maxRetries);

        String response = webClient.post()
            .uri(apiUrl)
            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
            .header("x-api-key", apiKey)
            .header("anthropic-version", "2023-06-01")
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(String.class)
            .timeout(java.time.Duration.ofMinutes(5)) // 5 minute timeout
            .block();

        log.info("Successfully received response from Claude API");
        return response;

      } catch (org.springframework.web.reactive.function.client.WebClientRequestException e) {
        // Connection reset or network error
        if (attempt < maxRetries) {
          log.warn("Connection error on attempt {}, retrying in {}ms: {}", attempt, retryDelayMs, e.getMessage());
          try {
            Thread.sleep(retryDelayMs);
          } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Retry interrupted", ie);
          }
        } else {
          log.error("All retry attempts failed");
          throw e;
        }
      } catch (Exception e) {
        // Other errors shouldn't retry
        log.error("Non-retryable error calling Claude API", e);
        throw e;
      }
    }

    throw new RuntimeException("Failed to call Claude API after " + maxRetries + " attempts");
  }

  /**
   * Validate JSON and attempt to fix common issues
   */
  private String validateAndFixJson(String json) {
    if (json == null || json.isEmpty()) {
      return json;
    }

    // First, try to parse as-is
    try {
      objectMapper.readTree(json);
      log.info("JSON schema is valid");
      return json;
    } catch (Exception e) {
      log.warn("JSON validation failed, attempting to fix: {}", e.getMessage());
    }

    // Try common fixes
    String fixed = json;

    // Fix 1: Remove any trailing content after the last closing brace
    int lastBrace = fixed.lastIndexOf('}');
    if (lastBrace > 0 && lastBrace < fixed.length() - 1) {
      String trailing = fixed.substring(lastBrace + 1).trim();
      if (!trailing.isEmpty()) {
        log.info("Removing trailing content after JSON: '{}'",
            trailing.length() > 50 ? trailing.substring(0, 50) + "..." : trailing);
        fixed = fixed.substring(0, lastBrace + 1);
      }
    }

    // Fix 2: Remove trailing commas before closing braces/brackets
    fixed = fixed.replaceAll(",\\s*}", "}");
    fixed = fixed.replaceAll(",\\s*]", "]");

    // Fix 3: Try to fix unescaped quotes in strings (this is tricky and may not
    // always work)
    // This is a simple heuristic - replace common problematic patterns

    // Try to validate again
    try {
      objectMapper.readTree(fixed);
      log.info("JSON schema fixed and validated successfully");
      return fixed;
    } catch (Exception e) {
      log.error("Could not fix JSON schema: {}", e.getMessage());
      // Return original - let the error propagate with better messaging
      return json;
    }
  }

  /**
   * Strip markdown code fences from JSON schema if present
   */
  private String stripMarkdownCodeFence(String content) {
    if (content == null) {
      return null;
    }

    // Remove ```json at the beginning and ``` at the end
    String trimmed = content.trim();

    if (trimmed.startsWith("```json")) {
      trimmed = trimmed.substring(7); // Remove ```json
    } else if (trimmed.startsWith("```")) {
      trimmed = trimmed.substring(3); // Remove ```
    }

    if (trimmed.endsWith("```")) {
      trimmed = trimmed.substring(0, trimmed.length() - 3); // Remove trailing ```
    }

    return trimmed.trim();
  }

  private String buildAnalysisPrompt() {
    return """
        You are an expert at analyzing PDF enrollment forms and converting them into JSON Schema format.

        I will provide you with images of a patient enrollment form PDF. Your task is to analyze the form
        and generate a JSON Schema that matches the exact format we use in our system.

        ## CRITICAL: PATIENT SECTIONS ONLY

        IMPORTANT: ONLY analyze and include fields from PATIENT sections of the form.

        Focus on sections where the PATIENT provides information and signs.
        Skip sections where HEALTHCARE PROVIDERS provide information.

        **PATIENT SECTIONS TO INCLUDE:**
        - Patient demographics (name, DOB, address, gender)
        - Patient contact details (phone, email, preferred language)
        - Insurance information (when patient provides card details)
        - Consent checkboxes and signatures (patient authorization)
        - Caregiver information (if patient is a minor)
        - Patient preferences (best time to call, communication preferences)

        **PROVIDER SECTIONS TO SKIP:**
        - Prescriber/physician information (NPI, license, office details)
        - Diagnosis codes (ICD-10)
        - Prescription details (medication, dosage, refills)
        - Provider signatures and certifications
        - Healthcare professional contact information

        **When in doubt:** If the section says "FOR HEALTHCARE PROFESSIONALS" or requires
        medical licensing information (NPI, State License, etc.), SKIP IT.

        ## JSON SCHEMA FORMAT

        The schema must follow this structure:

        ```json
        {
          "$schema": "http://json-schema.org/draft-07/schema#",
          "title": "[Form Title]",
          "description": "[Form Description]",
          "type": "object",
          "x-form-config": {
            "formId": "[kebab-case-form-id]",
            "version": "1.0",
            "pages": [
              {
                "pageId": "[page-id]",
                "title": "[Page Title]",
                "sections": [
                  {
                    "sectionId": "[section-id]",
                    "title": "[Section Title]",
                    "description": "[Optional description]",
                    "layout": [
                      {
                        "type": "row",
                        "columns": [
                          {
                            "width": "[percentage like 50%, 100%, 40%]",
                            "fields": ["[fieldName]"]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          "properties": {
            "[fieldName]": {
              "type": "[string|boolean]",
              "title": "[Field Label]",
              "x-field-config": {
                "required": [true|false],
                "fieldType": "[text|email|date|phone|select|radio|checkbox|html]",
                "placeholder": "[optional]",
                "options": [...]  // For select/radio
              }
            }
          },
          "required": ["field1", "field2"]
        }
        ```

        ## FIELD TYPES

        - **text**: Regular text input
        - **email**: Email input with validation
        - **date**: Date picker
        - **phone**: Phone number with mask (999) 999-9999
        - **select**: Dropdown menu (requires "options" array)
        - **radio**: Radio buttons (requires "options" array, can have "layout": "horizontal" or "vertical")
        - **checkbox**: Single checkbox (type: "boolean")
        - **html**: Static HTML content display

        ## LAYOUT INSTRUCTIONS

        Analyze the visual layout carefully:

        1. **Side-by-side fields**: If two fields appear horizontally next to each other, they should be in the same row with appropriate width percentages (e.g., 50%/50% or 60%/40%)

        2. **Full-width fields**: If a field spans the entire width, use 100% width

        3. **Visual sections**: Group fields under section headers you see in the PDF

        4. **Field order**: Maintain the exact order of fields as they appear top-to-bottom in the PDF

        ## FIELD NAMING

        - Convert field labels to camelCase (e.g., "First Name" → "firstName")
        - Keep names descriptive and clear

        ## REQUIRED FIELDS

        - Look for asterisks (*) or "(required)" text to identify required fields
        - Add these field names to the "required" array at the root level

        ## EXAMPLES

        **Example 1: Side-by-side text fields**
        PDF shows: [First Name] [Middle Name] on same line

        ```json
        "layout": [
          {
            "type": "row",
            "columns": [
              { "width": "50%", "fields": ["firstName"] },
              { "width": "50%", "fields": ["middleName"] }
            ]
          }
        ]
        ```

        **Example 2: Dropdown with narrower width next to text field**
        PDF shows: [State dropdown (narrow)] [ZIP code (wider)] on same line

        ```json
        "layout": [
          {
            "type": "row",
            "columns": [
              { "width": "40%", "fields": ["state"] },
              { "width": "60%", "fields": ["zip"] }
            ]
          }
        ]
        ```

        **Example 3: Radio buttons**
        ```json
        "usResident": {
          "type": "string",
          "title": "Is the patient a US resident?",
          "enum": ["yes", "no"],
          "x-field-config": {
            "required": true,
            "fieldType": "radio",
            "options": [
              { "value": "yes", "label": "Yes" },
              { "value": "no", "label": "No" }
            ],
            "layout": "horizontal"
          }
        }
        ```

        ## YOUR TASK

        Analyze the PDF form images I'm providing and generate a complete JSON Schema following the format above.

        IMPORTANT:
        - Return ONLY the raw JSON schema without any markdown code fences or formatting
        - Do NOT wrap the JSON in ```json or ``` markers
        - Pay close attention to visual layout (side-by-side fields, groupings)
        - Include ONLY patient-facing fields (skip all provider sections)
        - Use appropriate field types based on the input type shown

        ## CRITICAL: JSON VALIDITY REQUIREMENTS

        Your output MUST be valid, parseable JSON. Before returning your response:

        1. **Validate JSON syntax**: Ensure every opening brace { has a closing brace }, every opening bracket [ has a closing bracket ], and every property has a comma after it (except the last one in an object/array).

        2. **Escape special characters in strings**: Any text content in string values must have these characters escaped:
           - Double quotes inside strings: use \\" instead of "
           - Backslashes: use \\\\ instead of \\
           - Newlines: use \\n instead of actual line breaks
           - Tabs: use \\t instead of actual tabs
           - Registered trademark ®, copyright ©, trademark ™ symbols are OK but avoid other special Unicode characters

        3. **No trailing commas**: Do NOT put a comma after the last item in an object or array.

        4. **Proper string quoting**: All property names and string values must be enclosed in double quotes.

        5. **Self-check**: After generating the JSON, mentally parse through it to verify it would be valid if passed to JSON.parse().

        Generate the JSON Schema now (raw JSON only, no markdown):
        """;
  }
}
