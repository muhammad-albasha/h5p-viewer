package com.example.h5pviewer.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "h5p_contents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class H5PContent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "h5p_content_categories",
        joinColumns = @JoinColumn(name = "h5p_content_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();

    @Column(nullable = true)
    private String previewImage;

    @Column(nullable = true)
    private String h5pJsonPath;    @Column(columnDefinition = "LONGTEXT")
    private String info;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "h5p_content_faculties",
        joinColumns = @JoinColumn(name = "h5p_content_id"),
        inverseJoinColumns = @JoinColumn(name = "faculty_id")
    )
    private Set<Faculty> faculties = new HashSet<>();
      // Helper methods for managing categories
    public void addCategory(Category category) {
        this.categories.add(category);
        category.getH5pContents().add(this);
    }
    
    public void removeCategory(Category category) {
        this.categories.remove(category);
        category.getH5pContents().remove(this);
    }
    
    // Helper methods for managing faculties
    public void addFaculty(Faculty faculty) {
        this.faculties.add(faculty);
        faculty.getH5pContents().add(this);
    }
    
    public void removeFaculty(Faculty faculty) {
        this.faculties.remove(faculty);
        faculty.getH5pContents().remove(this);
    }
}
