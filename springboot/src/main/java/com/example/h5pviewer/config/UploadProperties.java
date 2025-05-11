package com.example.h5pviewer.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.upload")
public class UploadProperties {
    
    private String dir;
    private String h5pDir;
    private String imagesDir;
    
    // Getters and setters
    public String getDir() {
        return dir;
    }
    
    public void setDir(String dir) {
        this.dir = dir;
    }
    
    public String getH5pDir() {
        return h5pDir;
    }
    
    public void setH5pDir(String h5pDir) {
        this.h5pDir = h5pDir;
    }
    
    public String getImagesDir() {
        return imagesDir;
    }
    
    public void setImagesDir(String imagesDir) {
        this.imagesDir = imagesDir;
    }
}
