package com.example.h5pviewer.service;

import com.example.h5pviewer.entity.H5PContent;
import com.example.h5pviewer.repository.H5PContentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class H5PContentService {
    @Autowired
    private H5PContentRepository h5pContentRepository;

    public List<H5PContent> getAllContents() {
        return h5pContentRepository.findAll();
    }

    public Optional<H5PContent> getContentById(Long id) {
        return h5pContentRepository.findById(id);
    }

    public H5PContent createContent(H5PContent content) {
        return h5pContentRepository.save(content);
    }

    public void deleteContent(Long id) {
        h5pContentRepository.deleteById(id);
    }
}
