package com.alice.gametracker.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.alice.gametracker.dto.CreateEchoRequest;
import com.alice.gametracker.dto.DeactivateWeaponRequest;
import com.alice.gametracker.dto.EchoResponse;
import com.alice.gametracker.dto.UpdateEchoRequest;
import com.alice.gametracker.model.Echo;
import com.alice.gametracker.model.SetEcho;
import com.alice.gametracker.service.EchoService;
import com.alice.gametracker.service.FileStorageService;

import jakarta.annotation.PostConstruct;

@RestController
@RequestMapping("/api/echoes")
public class EchoController {

    @Autowired
    private EchoService echoService;

    @Autowired
    private FileStorageService fileStorageService;

    private static final Logger log = LoggerFactory.getLogger(EchoController.class);

    @Value("${app.echo.storage.location:${app.character.storage.location}}")
    private String echoStorageLocation;

    @Value("${app.echo.url.pattern:${app.character.url.pattern}}")
    private String echoUrlPattern;

    private Path echoStoragePath;

    @PostConstruct
    public void init() {
        this.echoStoragePath = Paths.get(echoStorageLocation).toAbsolutePath().normalize();
    }

    @PostMapping(consumes = "application/json")
    public ResponseEntity<EchoResponse> createEcho(@RequestBody CreateEchoRequest req) {
        Echo saved = echoService.createFromDto(req);
        // fetch response via service (ensures collections are loaded inside transaction)
        EchoResponse resp = echoService.findByIdResponse(saved.getId()).orElseThrow(() -> new RuntimeException("Echo not found after create"));
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PutMapping(path = "/{id}", consumes = "application/json")
    public ResponseEntity<EchoResponse> updateEcho(@PathVariable Long id, @RequestBody UpdateEchoRequest req) {
        Echo updated = echoService.updateFromDto(id, req);
        EchoResponse resp = echoService.findByIdResponse(updated.getId()).orElseThrow(() -> new RuntimeException("Echo not found after update"));
        return ResponseEntity.ok(resp);
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<EchoResponse> deactivateEcho(@PathVariable Long id, @RequestBody DeactivateWeaponRequest req) {
        EchoResponse resp = echoService.deactivateEcho(id, req);
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEcho(@PathVariable Long id) throws Exception {
        // Delete image if exists, echoService.deleteById will remove DB record
        Echo e = echoService.findById(id).orElseThrow(() -> new RuntimeException("Echo not found"));
        if (e.getImageUrl() != null) {
            try { fileStorageService.deleteFile(e.getImageUrl()); } catch (java.io.IOException ex) { log.warn("Failed to delete echo image: {}", ex.getMessage()); }
        }
        echoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<EchoResponse>> getAll() {
        return ResponseEntity.ok(echoService.findAllResponses());
    }

    @GetMapping("/active")
    public ResponseEntity<List<EchoResponse>> getActive() {
        return ResponseEntity.ok(echoService.findActiveResponses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EchoResponse> getById(@PathVariable Long id) {
        Optional<EchoResponse> opt = echoService.findByIdResponse(id);
        return opt.map(r -> ResponseEntity.ok(r)).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/upload-image")
    public ResponseEntity<EchoResponse> uploadImage(@PathVariable Long id, @RequestParam("image") MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) return ResponseEntity.badRequest().build();
        EchoResponse resp = echoService.updateEchoImage(id, file);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/image/{filename:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        try {
            Path filePath = echoStoragePath.resolve(filename).normalize();
            if (!filePath.startsWith(echoStoragePath)) return ResponseEntity.notFound().build();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                String contentType = null;
                try { contentType = Files.probeContentType(filePath); } catch (IOException ex) {}
                if (contentType == null) contentType = "application/octet-stream";
                return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType)).header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename='"+resource.getFilename()+"'").body(resource);
            } else return ResponseEntity.notFound().build();
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private EchoResponse convertToResponse(Echo e) {
        List<Long> setEchoIds = e.getSetEchoes().stream()
            .map(SetEcho::getId)
            .collect(Collectors.toList());
        return new EchoResponse(e.getId(), e.getImageUrl(), e.getName(), e.getDescription(), 
                                e.getCost(), e.getSkill(), setEchoIds, e.isActive(), e.getCreatedDate());
    }
}
