package com.example.h5pviewer.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StorageConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(StorageConfig.class);
    
    private final UploadProperties uploadProperties;
    
    public StorageConfig(UploadProperties uploadProperties) {
        this.uploadProperties = uploadProperties;
    }
    
    @Bean
    CommandLineRunner createUploadDirectories() {
        return args -> {
            try {
                // Create directories if they don't exist
                Path h5pPath = Paths.get(uploadProperties.getH5pDir());
                if (!Files.exists(h5pPath)) {
                    Files.createDirectories(h5pPath);
                    logger.info("Created H5P upload directory: {}", h5pPath.toAbsolutePath());
                }
                
                Path imagesPath = Paths.get(uploadProperties.getImagesDir());
                if (!Files.exists(imagesPath)) {
                    Files.createDirectories(imagesPath);
                    logger.info("Created images upload directory: {}", imagesPath.toAbsolutePath());
                }
            } catch (Exception e) {
                logger.error("Failed to create upload directories", e);
                throw e;
            }
        };
    }
}
