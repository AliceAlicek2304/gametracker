package com.alice.gametracker.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
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
@RequestMapping("/api/background")
public class BackgroundController {

    @Autowired
    private FileStorageService fileStorageService;

    // Get list of background files with full URLs - Returns [{"filename": "file1.jpg", "url": "https://..."}]
    @GetMapping
    public ResponseEntity<List<Map<String, String>>> getBackgroundFiles() {
        try {
            List<String> filenames = fileStorageService.listBackgroundFiles();
            List<Map<String, String>> result = new ArrayList<>();
            
            for (String filename : filenames) {
                Map<String, String> item = new HashMap<>();
                item.put("filename", filename);
                item.put("url", fileStorageService.getBackgroundImageUrl(filename));
                result.add(item);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get list of background filenames only (backward compatibility)
    @GetMapping("/filenames")
    public ResponseEntity<List<String>> getBackgroundFilenames() {
        try {
            List<String> filenames = fileStorageService.listBackgroundFiles();
            return ResponseEntity.ok(filenames);
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Serve background image files - redirects to S3 if S3 storage, serves file if local storage
    @GetMapping("/image/{filename:.+}")
    public ResponseEntity<Resource> serveBackgroundImage(@PathVariable String filename) {
        // If using S3, redirect to S3 URL
        if (fileStorageService.isS3Storage()) {
            String s3Url = fileStorageService.getBackgroundImageUrl(filename);
            return ResponseEntity.status(302)
                    .header(HttpHeaders.LOCATION, s3Url)
                    .build();
        }

        // Local storage: serve file directly
        try {
            Path backgroundStoragePath = fileStorageService.getBackgroundStoragePath();
            Path filePath = backgroundStoragePath.resolve(filename).normalize();

            // Security check: ensure the file is within the storage directory
            if (!filePath.startsWith(backgroundStoragePath)) {
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