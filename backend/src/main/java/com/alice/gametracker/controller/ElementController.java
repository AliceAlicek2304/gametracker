package com.alice.gametracker.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alice.gametracker.service.FileStorageService;

@RestController
@RequestMapping("/api/elements")
public class ElementController {

    @Autowired
    private FileStorageService fileStorageService;

    // List all element icon files with their URLs - Returns [{"filename": "fire.png", "url": "https://..."}]
    @GetMapping("/icons")
    public ResponseEntity<List<Map<String, String>>> listElementIcons() {
        try {
            List<String> filenames = fileStorageService.listElementFiles();
            List<Map<String, String>> result = new java.util.ArrayList<>();
            
            for (String filename : filenames) {
                Map<String, String> item = new HashMap<>();
                item.put("filename", filename);
                item.put("url", fileStorageService.getElementIconUrl(filename));
                result.add(item);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Serve element icon files - redirects to S3 if S3 storage, serves file if local storage
    @GetMapping("/icon/{filename:.+}")
    public ResponseEntity<Resource> serveElementIcon(@PathVariable String filename) {
        // If using S3, redirect to S3 URL
        if (fileStorageService.isS3Storage()) {
            String s3Url = fileStorageService.getElementIconUrl(filename);
            return ResponseEntity.status(302)
                    .header(HttpHeaders.LOCATION, s3Url)
                    .build();
        }

        // Local storage: serve file directly
        try {
            Path elementStoragePath = fileStorageService.getElementStoragePath();
            Path filePath = elementStoragePath.resolve(filename).normalize();

            // Security check: ensure the file is within the storage directory
            if (!filePath.startsWith(elementStoragePath)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = null;
                try {
                    contentType = Files.probeContentType(filePath);
                } catch (IOException ex) {
                    // ignore
                }
                if (contentType == null) contentType = "application/octet-stream";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
