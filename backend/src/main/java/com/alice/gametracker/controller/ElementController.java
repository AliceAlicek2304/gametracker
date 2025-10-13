package com.alice.gametracker.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

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

    // Serve element icon files (public)
    // GET /api/elements/icon/{filename}
    @GetMapping("/icon/{filename:.+}")
    public ResponseEntity<Resource> serveElementIcon(@PathVariable String filename) {
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
