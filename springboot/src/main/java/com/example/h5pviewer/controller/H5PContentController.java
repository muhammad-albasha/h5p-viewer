package com.example.h5pviewer.controller;

import com.example.h5pviewer.entity.H5PContent;
import com.example.h5pviewer.service.H5PContentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/h5p-contents")
public class H5PContentController {
    @Autowired
    private H5PContentService h5pContentService;

    @GetMapping
    public List<H5PContent> getAllContents() {
        return h5pContentService.getAllContents();
    }

    @GetMapping("/{id}")
    public ResponseEntity<H5PContent> getContentById(@PathVariable Long id) {
        Optional<H5PContent> content = h5pContentService.getContentById(id);
        return content.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public H5PContent createContent(@RequestBody H5PContent content) {
        return h5pContentService.createContent(content);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContent(@PathVariable Long id) {
        h5pContentService.deleteContent(id);
        return ResponseEntity.noContent().build();
    }
}
