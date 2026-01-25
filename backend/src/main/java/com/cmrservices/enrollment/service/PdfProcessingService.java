package com.cmrservices.enrollment.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
public class PdfProcessingService {

    private static final Logger log = LoggerFactory.getLogger(PdfProcessingService.class);
    private static final int DPI = 150; // Resolution for rendering

    /**
     * Convert PDF pages to base64-encoded PNG images
     */
    public List<String> convertPdfToBase64Images(byte[] pdfBytes) throws IOException {
        log.info("Converting PDF to images");
        List<String> base64Images = new ArrayList<>();

        try (PDDocument document = PDDocument.load(new ByteArrayInputStream(pdfBytes))) {
            PDFRenderer renderer = new PDFRenderer(document);
            int pageCount = document.getNumberOfPages();

            log.info("PDF has {} pages", pageCount);

            for (int pageIndex = 0; pageIndex < pageCount; pageIndex++) {
                log.debug("Rendering page {}", pageIndex + 1);

                try {
                    // Render page to image
                    BufferedImage image = renderer.renderImageWithDPI(pageIndex, DPI);

                    // Convert to PNG bytes
                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    ImageIO.write(image, "PNG", baos);
                    byte[] imageBytes = baos.toByteArray();

                    // Encode to base64
                    String base64Image = Base64.getEncoder().encodeToString(imageBytes);
                    base64Images.add(base64Image);

                } catch (ExceptionInInitializerError e) {
                    log.error("PDFBox font system initialization failed - this is a known macOS issue with malformed system fonts", e);
                    throw new IOException("PDF rendering failed due to macOS font system error. " +
                        "This is caused by malformed system fonts on macOS. " +
                        "Workaround: Try restarting the JVM or contact support for font configuration help.", e);
                } catch (NoClassDefFoundError e) {
                    if (e.getMessage() != null && e.getMessage().contains("FontMapperImpl$DefaultFontProvider")) {
                        log.error("PDFBox font provider failed to initialize - malformed system fonts detected", e);
                        throw new IOException("PDF rendering failed due to corrupted system fonts. " +
                            "This is a macOS-specific issue. Please try a different PDF or contact support.", e);
                    }
                    throw new IOException("PDF rendering failed", e);
                } catch (Exception e) {
                    log.error("Failed to render page {} - attempting to continue with remaining pages", pageIndex + 1, e);
                    // Continue processing other pages even if one fails
                }
            }
        } catch (ExceptionInInitializerError | NoClassDefFoundError e) {
            // Catch at document level in case it happens during renderer creation
            log.error("PDFBox initialization failed due to system font issues", e);
            throw new IOException("Cannot process PDF due to macOS font system errors. " +
                "This requires JVM restart or system font repair.", e);
        } catch (IOException e) {
            log.error("Error loading or processing PDF document", e);
            throw e;
        }

        if (base64Images.isEmpty()) {
            throw new IOException("Failed to render any pages from PDF");
        }

        log.info("Successfully converted {} pages to base64 images", base64Images.size());
        return base64Images;
    }
}
