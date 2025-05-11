package com.example.h5pviewer.controller;

import com.example.h5pviewer.config.UploadProperties;
import com.example.h5pviewer.entity.H5PContent;
import com.example.h5pviewer.service.H5PContentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@RestController
@RequestMapping("/api/h5p-contents")
public class H5PContentController {
    private final H5PContentService h5pContentService;
    private final UploadProperties uploadProperties;

    // Field for logging
    private static final Logger logger = LoggerFactory.getLogger(H5PContentController.class);

    public H5PContentController(H5PContentService h5pContentService, UploadProperties uploadProperties) {
        this.h5pContentService = h5pContentService;
        this.uploadProperties = uploadProperties;
    }

    @GetMapping
    public ResponseEntity<List<H5PContent>> getAllContents() {
        return ResponseEntity.ok(h5pContentService.getAllContents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<H5PContent> getContentById(@PathVariable Long id) {
        return ResponseEntity.ok(h5pContentService.getContentById(id));
    }

    @PostMapping
    public ResponseEntity<H5PContent> createContent(@RequestBody H5PContent content) {
        return ResponseEntity.status(HttpStatus.CREATED).body(h5pContentService.createContent(content));
    }

    @PutMapping("/{id}")
    public ResponseEntity<H5PContent> updateContent(@PathVariable Long id, @RequestBody H5PContent contentDetails) {
        return ResponseEntity.ok(h5pContentService.updateContent(id, contentDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContent(@PathVariable Long id) {
        h5pContentService.deleteContent(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{contentId}/categories/{categoryId}")
    public ResponseEntity<H5PContent> addCategoryToContent(
            @PathVariable Long contentId,
            @PathVariable Long categoryId) {
        try {
            H5PContent content = h5pContentService.addCategoryToContent(contentId, categoryId);
            return ResponseEntity.ok(content);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{contentId}/categories/{categoryId}")
    public ResponseEntity<H5PContent> removeCategoryFromContent(
            @PathVariable Long contentId,
            @PathVariable Long categoryId) {
        try {
            H5PContent content = h5pContentService.removeCategoryFromContent(contentId, categoryId);
            return ResponseEntity.ok(content);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{contentId}/categories")
    public ResponseEntity<H5PContent> updateContentCategories(
            @PathVariable Long contentId,
            @RequestBody Map<String, List<Long>> categories) {
        try {
            List<Long> categoryIds = categories.get("categoryIds");
            if (categoryIds == null) {
                return ResponseEntity.badRequest().build();
            }
            H5PContent content = h5pContentService.updateContentCategories(contentId, categoryIds);
            return ResponseEntity.ok(content);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Search endpoints
    @GetMapping("/search")
    public ResponseEntity<List<H5PContent>> searchContentsByName(@RequestParam String name) {
        return ResponseEntity.ok(h5pContentService.searchContentsByName(name));
    }

    @GetMapping("/by-category/{categoryId}")
    public ResponseEntity<List<H5PContent>> getContentsByCategoryId(@PathVariable Long categoryId) {
        try {
            return ResponseEntity.ok(h5pContentService.getContentsByCategoryId(categoryId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/by-category-name")
    public ResponseEntity<List<H5PContent>> getContentsByCategoryName(@RequestParam String name) {
        return ResponseEntity.ok(h5pContentService.getContentsByCategoryName(name));
    }

    // Faculty endpoints
    @PostMapping("/{contentId}/faculties/{facultyId}")
    public ResponseEntity<H5PContent> addFacultyToContent(
            @PathVariable Long contentId,
            @PathVariable Long facultyId) {
        try {
            H5PContent content = h5pContentService.addFacultyToContent(contentId, facultyId);
            return ResponseEntity.ok(content);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{contentId}/faculties/{facultyId}")
    public ResponseEntity<H5PContent> removeFacultyFromContent(
            @PathVariable Long contentId,
            @PathVariable Long facultyId) {
        try {
            H5PContent content = h5pContentService.removeFacultyFromContent(contentId, facultyId);
            return ResponseEntity.ok(content);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{contentId}/faculties")
    public ResponseEntity<H5PContent> updateContentFaculties(
            @PathVariable Long contentId,
            @RequestBody Map<String, List<Long>> faculties) {
        try {
            List<Long> facultyIds = faculties.get("facultyIds");
            if (facultyIds == null) {
                return ResponseEntity.badRequest().build();
            }
            H5PContent content = h5pContentService.updateContentFaculties(contentId, facultyIds);
            return ResponseEntity.ok(content);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/by-faculty/{facultyId}")
    public ResponseEntity<List<H5PContent>> getContentsByFacultyId(@PathVariable Long facultyId) {
        try {
            return ResponseEntity.ok(h5pContentService.getContentsByFacultyId(facultyId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/by-faculty-name")
    public ResponseEntity<List<H5PContent>> getContentsByFacultyName(@RequestParam String name) {
        return ResponseEntity.ok(h5pContentService.getContentsByFacultyName(name));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadH5PContent(
            @RequestParam("h5pFile") MultipartFile h5pFile,
            @RequestParam("imageFile") MultipartFile imageFile,
            @RequestParam("info") String info,
            @RequestParam("facultyIds") List<Long> facultyIds,
            @RequestParam("categoryIds") List<Long> categoryIds) {

        logger.debug("Received upload request for H5P content");

        try {
            // Create unique ID for this upload
            String uniqueId = UUID.randomUUID().toString();

            // Use configured directories from properties
            Path h5pUploadDir = Paths.get(uploadProperties.getH5pDir(), uniqueId);
            Files.createDirectories(h5pUploadDir);
            logger.debug("Created H5P upload directory: {}", h5pUploadDir);

            // Save image file
            String originalFilename = imageFile.getOriginalFilename();
            String imageFileName = uniqueId + "_" + (originalFilename != null ? originalFilename : "image.jpg");
            Path imagePath = Paths.get(uploadProperties.getImagesDir(), imageFileName);
            Files.createDirectories(imagePath.getParent());
            Files.copy(imageFile.getInputStream(), imagePath);
            logger.debug("Saved image file to: {}", imagePath);

            // Extract H5P content
            try (ZipInputStream zipIn = new ZipInputStream(h5pFile.getInputStream())) {
                ZipEntry entry;
                boolean hasContentJson = false;

                while ((entry = zipIn.getNextEntry()) != null) {
                    String entryName = entry.getName();
                    Path targetPath = h5pUploadDir.resolve(entryName);

                    // Create directories if needed
                    if (entry.isDirectory()) {
                        Files.createDirectories(targetPath);
                    } else {
                        // Create parent directories if they don't exist
                        Files.createDirectories(targetPath.getParent());

                        // Copy file content
                        Files.copy(zipIn, targetPath);

                        // Check if content.json exists
                        if (entryName.equals("content.json") || entryName.endsWith("/content.json")) {
                            hasContentJson = true;
                            logger.debug("Found content.json at: {}", targetPath);
                        }
                    }
                    zipIn.closeEntry();
                }

                if (!hasContentJson) {
                    logger.error("H5P file does not contain content.json");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Invalid H5P file: content.json not found");
                }

                // Create H5P content entity
                H5PContent content = new H5PContent();
                String h5pFileName = h5pFile.getOriginalFilename();
                content.setName(h5pFileName != null ? h5pFileName.replace(".h5p", "") : "Unnamed H5P Content");
                content.setInfo(info);
                content.setPreviewImage("/images/" + imageFileName);
                content.setH5pJsonPath("/api/h5p-contents/preview/" + uniqueId + "/content.json");

                // Save to database with category and faculty associations
                H5PContent savedContent = h5pContentService.createContentWithRelations(content, categoryIds, facultyIds);

                return ResponseEntity.status(HttpStatus.CREATED).body(savedContent);
            }

        } catch (IOException e) {
            logger.error("Error processing H5P upload: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing H5P upload: " + e.getMessage());
        }
    }
}
