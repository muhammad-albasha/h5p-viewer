package com.example.h5pviewer.controller;

import com.example.h5pviewer.entity.Category;
import com.example.h5pviewer.entity.Faculty;
import com.example.h5pviewer.entity.H5PContent;
import com.example.h5pviewer.repository.CategoryRepository;
import com.example.h5pviewer.repository.FacultyRepository;
import com.example.h5pviewer.repository.H5PContentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/test")
public class TestDataController {

    @Autowired
    private H5PContentRepository h5pContentRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private FacultyRepository facultyRepository;
    
    @PostMapping("/create-sample-data")
    public ResponseEntity<Map<String, Object>> createSampleData() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Create faculties
            List<Faculty> faculties = createFaculties();
            
            // Create categories
            List<Category> categories = createCategories();
            
            // Create H5P content with categories and faculties
            List<H5PContent> contents = createContents(faculties, categories);
            
            response.put("success", true);
            response.put("message", "Sample data created successfully");
            response.put("faculties", faculties);
            response.put("categories", categories);
            response.put("h5pContents", contents);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to create sample data");
            response.put("error", e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    private List<Faculty> createFaculties() {
        List<Faculty> faculties = new ArrayList<>();
        
        String[] facultyNames = {
            "Fakultät für Informatik", 
            "Fakultät für Mathematik", 
            "Fakultät für Physik",
            "Fakultät für Wirtschaftswissenschaften", 
            "Fakultät für Medizin"
        };
        
        for (String name : facultyNames) {
            Faculty faculty = new Faculty();
            faculty.setName(name);
            faculties.add(facultyRepository.save(faculty));
        }
        
        return faculties;
    }
    
    private List<Category> createCategories() {
        List<Category> categories = new ArrayList<>();
        
        Map<String, String> categoryData = new HashMap<>();
        categoryData.put("Mathematik", "Mathematische Konzepte und Übungen");
        categoryData.put("Physik", "Physikalische Simulationen und Experimente");
        categoryData.put("Informatik", "Programmierung und Informatikkonzepte");
        categoryData.put("Sprachen", "Sprachkurse und Übungen");
        categoryData.put("Medizin", "Medizinische Inhalte und Anatomie");
        categoryData.put("Wirtschaft", "Betriebswirtschaft und Volkswirtschaft");
        categoryData.put("Ingenieurwesen", "Technische und ingenieurwissenschaftliche Inhalte");
        
        for (Map.Entry<String, String> entry : categoryData.entrySet()) {
            Category category = new Category();
            category.setName(entry.getKey());
            category.setDescription(entry.getValue());
            categories.add(categoryRepository.save(category));
        }
        
        return categories;
    }
    
    private List<H5PContent> createContents(List<Faculty> faculties, List<Category> categories) {
        List<H5PContent> contents = new ArrayList<>();
        
        // Content 1: Math Quiz
        H5PContent content1 = new H5PContent();
        content1.setName("Mathematik Quiz");
        content1.setInfo("Ein interaktives Quiz zu grundlegenden mathematischen Konzepten");
        content1.setCategories(new HashSet<>(Arrays.asList(
            findCategoryByName(categories, "Mathematik")
        )));
        content1.setFaculties(new HashSet<>(Arrays.asList(
            findFacultyByName(faculties, "Fakultät für Mathematik")
        )));
        contents.add(h5pContentRepository.save(content1));
        
        // Content 2: Physics Simulation
        H5PContent content2 = new H5PContent();
        content2.setName("Physik Simulation: Gravitation");
        content2.setInfo("Eine interaktive Simulation zu Gravitationsphänomenen");
        content2.setCategories(new HashSet<>(Arrays.asList(
            findCategoryByName(categories, "Physik")
        )));
        content2.setFaculties(new HashSet<>(Arrays.asList(
            findFacultyByName(faculties, "Fakultät für Physik"),
            findFacultyByName(faculties, "Fakultät für Mathematik")
        )));
        contents.add(h5pContentRepository.save(content2));
        
        // Content 3: Programming Tutorial
        H5PContent content3 = new H5PContent();
        content3.setName("Programmier-Tutorial: Java Grundlagen");
        content3.setInfo("Ein Tutorial zu Java-Programmierung für Anfänger");
        content3.setCategories(new HashSet<>(Arrays.asList(
            findCategoryByName(categories, "Informatik"),
            findCategoryByName(categories, "Mathematik")
        )));
        content3.setFaculties(new HashSet<>(Arrays.asList(
            findFacultyByName(faculties, "Fakultät für Informatik")
        )));
        contents.add(h5pContentRepository.save(content3));
        
        // Content 4: Medical Anatomy
        H5PContent content4 = new H5PContent();
        content4.setName("Anatomie des menschlichen Körpers");
        content4.setInfo("Ein interaktiver Kurs zur menschlichen Anatomie");
        content4.setCategories(new HashSet<>(Arrays.asList(
            findCategoryByName(categories, "Medizin")
        )));
        content4.setFaculties(new HashSet<>(Arrays.asList(
            findFacultyByName(faculties, "Fakultät für Medizin")
        )));
        contents.add(h5pContentRepository.save(content4));
        
        // Content 5: Business Management
        H5PContent content5 = new H5PContent();
        content5.setName("Grundlagen des Projektmanagements");
        content5.setInfo("Ein Kurs zu Projektmanagement-Methoden und -Techniken");
        content5.setCategories(new HashSet<>(Arrays.asList(
            findCategoryByName(categories, "Wirtschaft"),
            findCategoryByName(categories, "Informatik")
        )));
        content5.setFaculties(new HashSet<>(Arrays.asList(
            findFacultyByName(faculties, "Fakultät für Wirtschaftswissenschaften"),
            findFacultyByName(faculties, "Fakultät für Informatik")
        )));
        contents.add(h5pContentRepository.save(content5));
        
        return contents;
    }
    
    private Category findCategoryByName(List<Category> categories, String name) {
        return categories.stream()
                .filter(c -> c.getName().equals(name))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Category not found: " + name));
    }
    
    private Faculty findFacultyByName(List<Faculty> faculties, String name) {
        return faculties.stream()
                .filter(f -> f.getName().equals(name))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Faculty not found: " + name));
    }
    
    @GetMapping("/verify-relationships")
    public ResponseEntity<Map<String, Object>> verifyRelationships() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Category> categories = categoryRepository.findAll();
            List<Faculty> faculties = facultyRepository.findAll();
            List<H5PContent> contents = h5pContentRepository.findAll();
            
            if (categories.isEmpty() || faculties.isEmpty() || contents.isEmpty()) {
                response.put("success", false);
                response.put("message", "No data found. Please run /create-sample-data first.");
                return ResponseEntity.ok(response);
            }
            
            Map<String, Object> relationships = buildRelationshipMaps(categories, faculties, contents);
            
            response.put("success", true);
            response.put("message", "Relationships verified successfully");
            response.put("data", relationships);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to verify relationships");
            response.put("error", e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    private Map<String, Object> buildRelationshipMaps(List<Category> categories, List<Faculty> faculties, List<H5PContent> contents) {
        Map<String, Object> relationships = new HashMap<>();
        
        // Map categories to their contents
        Map<String, List<String>> categoryToContents = new HashMap<>();
        for (Category category : categories) {
            List<String> contentNames = category.getH5pContents().stream()
                    .map(H5PContent::getName)
                    .collect(Collectors.toList());
            categoryToContents.put(category.getName(), contentNames);
        }
        relationships.put("categoryToContents", categoryToContents);
        
        // Map faculties to their contents
        Map<String, List<String>> facultyToContents = new HashMap<>();
        for (Faculty faculty : faculties) {
            List<String> contentNames = faculty.getH5pContents().stream()
                    .map(H5PContent::getName)
                    .collect(Collectors.toList());
            facultyToContents.put(faculty.getName(), contentNames);
        }
        relationships.put("facultyToContents", facultyToContents);
        
        // Map contents to their categories and faculties
        Map<String, Map<String, List<String>>> contentRelationships = new HashMap<>();
        for (H5PContent content : contents) {
            Map<String, List<String>> contentRelationship = new HashMap<>();
            
            List<String> categoryNames = content.getCategories().stream()
                    .map(Category::getName)
                    .collect(Collectors.toList());
            contentRelationship.put("categories", categoryNames);
            
            List<String> facultyNames = content.getFaculties().stream()
                    .map(Faculty::getName)
                    .collect(Collectors.toList());
            contentRelationship.put("faculties", facultyNames);
            
            contentRelationships.put(content.getName(), contentRelationship);
        }
        relationships.put("contentRelationships", contentRelationships);
        
        // Summary statistics
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalCategories", categories.size());
        statistics.put("totalFaculties", faculties.size());
        statistics.put("totalContents", contents.size());
        
        // Categories with most content
        Map<String, Integer> categoryContentCounts = new HashMap<>();
        for (Category category : categories) {
            categoryContentCounts.put(category.getName(), category.getH5pContents().size());
        }
        statistics.put("categoryContentCounts", categoryContentCounts);
        
        // Faculties with most content
        Map<String, Integer> facultyContentCounts = new HashMap<>();
        for (Faculty faculty : faculties) {
            facultyContentCounts.put(faculty.getName(), faculty.getH5pContents().size());
        }
        statistics.put("facultyContentCounts", facultyContentCounts);
        
        relationships.put("statistics", statistics);
        
        return relationships;
    }
    
    @DeleteMapping("/clean-data")
    public ResponseEntity<Map<String, Object>> cleanTestData() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Get counts before deletion
            long contentCount = h5pContentRepository.count();
            long categoryCount = categoryRepository.count();
            long facultyCount = facultyRepository.count();
            
            // Delete all h5p contents first to avoid foreign key constraints
            h5pContentRepository.deleteAll();
            categoryRepository.deleteAll();
            facultyRepository.deleteAll();
            
            response.put("success", true);
            response.put("message", "All test data cleaned successfully");
            response.put("deleted", Map.of(
                "h5pContents", contentCount,
                "categories", categoryCount,
                "faculties", facultyCount
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to clean test data");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
