package com.example.h5pviewer.service;

import com.example.h5pviewer.entity.Category;
import com.example.h5pviewer.entity.Faculty;
import com.example.h5pviewer.entity.H5PContent;
import com.example.h5pviewer.exception.ResourceNotFoundException;
import com.example.h5pviewer.repository.CategoryRepository;
import com.example.h5pviewer.repository.FacultyRepository;
import com.example.h5pviewer.repository.H5PContentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class H5PContentService {
    private static final Logger logger = LoggerFactory.getLogger(H5PContentService.class);
    
    private final H5PContentRepository h5pContentRepository;
    private final CategoryRepository categoryRepository;
    private final FacultyRepository facultyRepository;
    
    public H5PContentService(
            H5PContentRepository h5pContentRepository,
            CategoryRepository categoryRepository,
            FacultyRepository facultyRepository) {
        this.h5pContentRepository = h5pContentRepository;
        this.categoryRepository = categoryRepository;
        this.facultyRepository = facultyRepository;
    }

    @Cacheable("h5pContents")
    public List<H5PContent> getAllContents() {
        logger.debug("Fetching all H5P contents");
        return h5pContentRepository.findAll();
    }

    @Cacheable(value = "h5pContent", key = "#id")
    public H5PContent getContentById(Long id) {
        logger.debug("Fetching H5P content with id: {}", id);
        return h5pContentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("H5PContent", "id", id));
    }    @Transactional
    @CacheEvict(value = {"h5pContents", "h5pContent"}, allEntries = true)
    public H5PContent createContent(H5PContent content) {
        logger.debug("Creating new H5P content: {}", content.getName());
        return h5pContentRepository.save(content);
    }
    
    @Transactional
    @CacheEvict(value = {"h5pContents", "h5pContent"}, allEntries = true)
    public H5PContent updateContent(Long id, H5PContent contentDetails) {
        logger.debug("Updating H5P content with id: {}", id);
        
        H5PContent content = h5pContentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("H5PContent", "id", id));
        
        content.setName(contentDetails.getName());
        content.setPreviewImage(contentDetails.getPreviewImage());
        content.setH5pJsonPath(contentDetails.getH5pJsonPath());
        content.setInfo(contentDetails.getInfo());
        
        // Update faculties if provided
        if (contentDetails.getFaculties() != null) {
            content.setFaculties(contentDetails.getFaculties());
        }
        
        return h5pContentRepository.save(content);
    }    @Transactional
    @CacheEvict(value = {"h5pContents", "h5pContent"}, allEntries = true)
    public void deleteContent(Long id) {
        logger.debug("Deleting H5P content with id: {}", id);
        if (!h5pContentRepository.existsById(id)) {
            throw new ResourceNotFoundException("H5PContent", "id", id);
        }
        h5pContentRepository.deleteById(id);
    }
    
    @Transactional
    @CacheEvict(value = {"h5pContents", "h5pContent"}, allEntries = true)
    public H5PContent addCategoryToContent(Long contentId, Long categoryId) {
        logger.debug("Adding category {} to content {}", categoryId, contentId);
        
        H5PContent content = h5pContentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("H5PContent", "id", contentId));
        
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
        
        content.addCategory(category);
        return h5pContentRepository.save(content);
    }
    
    @Transactional
    @CacheEvict(value = {"h5pContents", "h5pContent"}, allEntries = true)
    public H5PContent removeCategoryFromContent(Long contentId, Long categoryId) {
        logger.debug("Removing category {} from content {}", categoryId, contentId);
        
        H5PContent content = h5pContentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("H5PContent", "id", contentId));
        
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
        
        content.removeCategory(category);
        return h5pContentRepository.save(content);
    }
    
    @Transactional
    public H5PContent updateContentCategories(Long contentId, List<Long> categoryIds) {
        H5PContent content = h5pContentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("H5P content not found with id: " + contentId));
        
        Set<Category> categories = new HashSet<>();
        for (Long categoryId : categoryIds) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
            categories.add(category);
        }
        
        // First remove existing relationships
        content.getCategories().forEach(cat -> cat.getH5pContents().remove(content));
        
        // Then set new relationships
        content.setCategories(categories);
        categories.forEach(cat -> cat.getH5pContents().add(content));
        
        return h5pContentRepository.save(content);
    }
      public List<H5PContent> findContentsByCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
        
        return new ArrayList<>(category.getH5pContents());
    }
    
    // Search contents by category using repository methods
    public List<H5PContent> getContentsByCategoryId(Long categoryId) {
        return h5pContentRepository.findByCategoryId(categoryId);
    }
    
    public List<H5PContent> getContentsByCategoryName(String categoryName) {
        return h5pContentRepository.findByCategoryName(categoryName);
    }
      public List<H5PContent> searchContentsByName(String name) {
        return h5pContentRepository.findByNameContainingIgnoreCase(name);
    }
    
    // Faculty management methods
    @Transactional
    public H5PContent addFacultyToContent(Long contentId, Long facultyId) {
        H5PContent content = h5pContentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("H5P content not found with id: " + contentId));
        
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found with id: " + facultyId));
        
        content.addFaculty(faculty);
        return h5pContentRepository.save(content);
    }
    
    @Transactional
    public H5PContent removeFacultyFromContent(Long contentId, Long facultyId) {
        H5PContent content = h5pContentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("H5P content not found with id: " + contentId));
        
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found with id: " + facultyId));
        
        content.removeFaculty(faculty);
        return h5pContentRepository.save(content);
    }
    
    @Transactional
    public H5PContent updateContentFaculties(Long contentId, List<Long> facultyIds) {
        H5PContent content = h5pContentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("H5P content not found with id: " + contentId));
        
        Set<Faculty> faculties = new HashSet<>();
        for (Long facultyId : facultyIds) {
            Faculty faculty = facultyRepository.findById(facultyId)
                    .orElseThrow(() -> new RuntimeException("Faculty not found with id: " + facultyId));
            faculties.add(faculty);
        }
        
        // First remove existing relationships
        content.getFaculties().forEach(fac -> fac.getH5pContents().remove(content));
        
        // Then set new relationships
        content.setFaculties(faculties);
        faculties.forEach(fac -> fac.getH5pContents().add(content));
        
        return h5pContentRepository.save(content);
    }
    
    public List<H5PContent> getContentsByFacultyId(Long facultyId) {
        return h5pContentRepository.findByFacultyId(facultyId);
    }
    
    public List<H5PContent> getContentsByFacultyName(String facultyName) {
        return h5pContentRepository.findByFacultyName(facultyName);
    }
}
