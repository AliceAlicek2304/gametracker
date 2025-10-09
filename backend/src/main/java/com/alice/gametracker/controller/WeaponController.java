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

import com.alice.gametracker.dto.CreateWeaponRequest;
import com.alice.gametracker.dto.DeactivateWeaponRequest;
import com.alice.gametracker.dto.UpdateWeaponRequest;
import com.alice.gametracker.dto.WeaponResponse;
import com.alice.gametracker.service.WeaponService;

import jakarta.annotation.PostConstruct;

@RestController
@RequestMapping("/api/weapons")
public class WeaponController {

    @Autowired
    private WeaponService weaponService;

    @Value("${app.weapon.storage.location:${app.role.storage.location}}")
    private String weaponStorageLocation;

    @Value("${app.weapon.url.pattern:${app.role.url.pattern}}")
    private String weaponUrlPattern;

    private Path weaponStoragePath;

    @PostConstruct
    public void init() {
        this.weaponStoragePath = Paths.get(weaponStorageLocation).toAbsolutePath().normalize();
    }

    // Create new weapon (JSON only)
    @PostMapping(consumes = "application/json")
    public ResponseEntity<WeaponResponse> createWeapon(@RequestBody CreateWeaponRequest request) throws Exception {
        WeaponResponse response = weaponService.createWeapon(request, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Update weapon (JSON only)
    @PutMapping(path = "/{id}", consumes = "application/json")
    public ResponseEntity<WeaponResponse> updateWeapon(@PathVariable Long id, @RequestBody UpdateWeaponRequest request) throws Exception {
        WeaponResponse response = weaponService.updateWeapon(id, request);
        return ResponseEntity.ok(response);
    }

    // Deactivate/activate weapon
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<WeaponResponse> deactivateWeapon(@PathVariable Long id, @RequestBody DeactivateWeaponRequest request) {
        WeaponResponse response = weaponService.deactivateWeapon(id, request);
        return ResponseEntity.ok(response);
    }

    // Hard delete weapon
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWeapon(@PathVariable Long id) throws Exception {
        weaponService.deleteWeapon(id);
        return ResponseEntity.noContent().build();
    }

    // Get weapon by ID
    @GetMapping("/{id}")
    public ResponseEntity<WeaponResponse> getWeaponById(@PathVariable Long id) {
        Optional<WeaponResponse> opt = weaponService.findByIdResponse(id);
        return opt.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // Get all weapons
    @GetMapping
    public ResponseEntity<List<WeaponResponse>> getAllWeapons() {
        List<WeaponResponse> resp = weaponService.findAllResponses();
        return ResponseEntity.ok(resp);
    }

    // Get active weapons only
    @GetMapping("/active")
    public ResponseEntity<List<WeaponResponse>> getActiveWeapons() {
        List<WeaponResponse> resp = weaponService.findActiveWeapons();
        return ResponseEntity.ok(resp);
    }

    // Upload weapon image
    @PostMapping("/{id}/upload-image")
    public ResponseEntity<WeaponResponse> uploadWeaponImage(@PathVariable Long id, @RequestParam("image") MultipartFile imageFile) throws Exception {
        WeaponResponse response = weaponService.updateWeaponImage(id, imageFile);
        return ResponseEntity.ok(response);
    }

    // Serve weapon image files (public)
    @GetMapping("/image/{filename:.+}")
    public ResponseEntity<Resource> serveWeaponImage(@PathVariable String filename) {
        try {
            Path filePath = weaponStoragePath.resolve(filename).normalize();

            // Security check: ensure the file is within the storage directory
            if (!filePath.startsWith(weaponStoragePath)) {
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
