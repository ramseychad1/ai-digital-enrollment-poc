package com.cmrservices.enrollment.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ColorDetectionService {

    private static final Logger log = LoggerFactory.getLogger(ColorDetectionService.class);

    /**
     * Extract dominant colors from screenshot
     */
    public List<String> extractDominantColors(byte[] imageBytes) {
        log.info("Extracting dominant colors from image");

        try {
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(imageBytes));

            // Sample colors from image (every 10th pixel for performance)
            Map<Integer, Integer> colorCount = new HashMap<>();

            for (int y = 0; y < image.getHeight(); y += 10) {
                for (int x = 0; x < image.getWidth(); x += 10) {
                    int rgb = image.getRGB(x, y);

                    // Skip very light colors (likely background)
                    if (!isNearWhite(rgb)) {
                        colorCount.put(rgb, colorCount.getOrDefault(rgb, 0) + 1);
                    }
                }
            }

            // Get top 6 most common colors
            List<String> dominantColors = colorCount.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(6)
                .map(entry -> rgbToHex(entry.getKey()))
                .collect(Collectors.toList());

            log.info("Extracted {} dominant colors", dominantColors.size());
            return dominantColors;

        } catch (Exception e) {
            log.error("Error extracting colors", e);
            // Return default colors on error
            return Arrays.asList("#E41F35", "#000000", "#FFFFFF", "#F5F5F5", "#666666", "#333333");
        }
    }

    private boolean isNearWhite(int rgb) {
        int r = (rgb >> 16) & 0xFF;
        int g = (rgb >> 8) & 0xFF;
        int b = rgb & 0xFF;

        // Consider "near white" if all values > 240
        return r > 240 && g > 240 && b > 240;
    }

    private String rgbToHex(int rgb) {
        int r = (rgb >> 16) & 0xFF;
        int g = (rgb >> 8) & 0xFF;
        int b = rgb & 0xFF;

        return String.format("#%02X%02X%02X", r, g, b);
    }
}
