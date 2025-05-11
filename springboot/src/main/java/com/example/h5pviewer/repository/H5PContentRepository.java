package com.example.h5pviewer.repository;

import com.example.h5pviewer.entity.H5PContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface H5PContentRepository extends JpaRepository<H5PContent, Long> {
    @Query("SELECT h FROM H5PContent h JOIN h.categories c WHERE c.id = :categoryId")
    List<H5PContent> findByCategoryId(@Param("categoryId") Long categoryId);
    
    @Query("SELECT h FROM H5PContent h JOIN h.categories c WHERE c.name = :categoryName")
    List<H5PContent> findByCategoryName(@Param("categoryName") String categoryName);
    
    @Query("SELECT h FROM H5PContent h JOIN h.faculties f WHERE f.id = :facultyId")
    List<H5PContent> findByFacultyId(@Param("facultyId") Long facultyId);
    
    @Query("SELECT h FROM H5PContent h JOIN h.faculties f WHERE f.name = :facultyName")
    List<H5PContent> findByFacultyName(@Param("facultyName") String facultyName);
    
    List<H5PContent> findByNameContainingIgnoreCase(String name);
}
