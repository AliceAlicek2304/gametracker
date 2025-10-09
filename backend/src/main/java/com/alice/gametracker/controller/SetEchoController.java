package com.alice.gametracker.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

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

import com.alice.gametracker.dto.CreateSetEchoRequest;
import com.alice.gametracker.dto.DeactivateWeaponRequest;
import com.alice.gametracker.dto.SetEchoResponse;
import com.alice.gametracker.dto.UpdateSetEchoRequest;
import com.alice.gametracker.service.SetEchoService;

import jakarta.annotation.PostConstruct;

@RestController
@RequestMapping("/api/set-echoes")
public class SetEchoController {

    @Autowired
    private SetEchoService setEchoService;

    @Value("${app.setecho.storage.location:${app.role.storage.location}}")
    private String setEchoStorageLocation;

    @Value("${app.setecho.url.pattern:${app.role.url.pattern}}")
    private String setEchoUrlPattern;

    private Path setEchoStoragePath;

    @PostConstruct
    public void init() {
        this.setEchoStoragePath = Paths.get(setEchoStorageLocation).toAbsolutePath().normalize();
    }

    @PostMapping(consumes = "application/json")
    public ResponseEntity<SetEchoResponse> createSetEcho(@RequestBody CreateSetEchoRequest req) throws Exception {
        SetEchoResponse resp = setEchoService.createSetEcho(req, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PutMapping(path = "/{id}", consumes = "application/json")
    public ResponseEntity<SetEchoResponse> updateSetEcho(@PathVariable Long id, @RequestBody UpdateSetEchoRequest req) throws Exception {
        SetEchoResponse resp = setEchoService.updateSetEcho(id, req);
        return ResponseEntity.ok(resp);
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<SetEchoResponse> deactivateSetEcho(@PathVariable Long id, @RequestBody DeactivateWeaponRequest req) {
        SetEchoResponse resp = setEchoService.deactivateSetEcho(id, req);
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSetEcho(@PathVariable Long id) throws Exception {
        setEchoService.deleteSetEcho(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<SetEchoResponse>> getAll() {
        return ResponseEntity.ok(setEchoService.findAllResponses());
    }

    @GetMapping("/active")
    public ResponseEntity<List<SetEchoResponse>> getActive() {
        return ResponseEntity.ok(setEchoService.findActiveSetEchoes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SetEchoResponse> getById(@PathVariable Long id) {
        Optional<SetEchoResponse> opt = setEchoService.findByIdResponse(id);
        return opt.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/upload-icon")
    public ResponseEntity<SetEchoResponse> uploadIcon(@PathVariable Long id, @RequestParam("icon") MultipartFile iconFile) throws Exception {
        SetEchoResponse resp = setEchoService.updateSetEchoIcon(id, iconFile);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/icon/{filename:.+}")
    public ResponseEntity<Resource> serveIcon(@PathVariable String filename) {
        try {
            Path filePath = setEchoStoragePath.resolve(filename).normalize();
            if (!filePath.startsWith(setEchoStoragePath)) return ResponseEntity.notFound().build();
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
}
