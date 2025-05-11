package com.example.h5pviewer.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

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

    @Column(nullable = true)
    private String category;

    @Column(nullable = true)
    private String previewImage;

    @Column(nullable = true)
    private String h5pJsonPath;

    @Column(columnDefinition = "LONGTEXT")
    private String info;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id", nullable = false)
    private Faculty faculty;
}
