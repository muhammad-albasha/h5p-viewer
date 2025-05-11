package com.example.h5pviewer.controller;

import com.example.h5pviewer.entity.H5PContent;
import com.example.h5pviewer.service.H5PContentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/h5p-contents")
public class H5PContentController {
    
    private final H5PContentService h5pContentService;
    

    public H5PContentController(H5PContentService h5pContentService) {
        this.h5pContentService = h5pContentService;
    }

    @GetMapping
    public ResponseEntity<List<H5PContent>> getAllContents() {
        return ResponseEntity.ok(h5pContentService.getAllContents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<H5PContent> getContentById(@PathVariable Long id) {
        return ResponseEntity.ok(h5pContentService.getContentById(id));
    }    @PostMapping
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
}
