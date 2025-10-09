package com.alice.gametracker.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

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

import com.alice.gametracker.dto.CreateRoleRequest;
import com.alice.gametracker.dto.DeactivateRoleRequest;
import com.alice.gametracker.dto.RoleResponse;
import com.alice.gametracker.dto.UpdateRoleRequest;
import com.alice.gametracker.service.RoleCharacterService;

import jakarta.annotation.PostConstruct;

@RestController
@RequestMapping("/api/roles")
public class RoleCharacterController {

    @Autowired
    private RoleCharacterService roleCharacterService;
    
    @Value("${app.role.storage.location}")
    private String roleStorageLocation;

    @Value("${app.role.url.pattern}")
    private String roleUrlPattern;

    private Path roleStoragePath;

    @PostConstruct
    public void init() {
        this.roleStoragePath = Paths.get(roleStorageLocation).toAbsolutePath().normalize();
    }
    // Create new role (JSON only)
    @PostMapping
    public ResponseEntity<RoleResponse> createRole(@RequestBody CreateRoleRequest request) throws Exception {
        RoleResponse response = roleCharacterService.createRole(request, null);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Update role (JSON only). Icon uploads are handled by POST /{id}/upload-icon
    @PutMapping(path = "/{id}", consumes = "application/json")
    public ResponseEntity<RoleResponse> updateRole(
            @PathVariable Long id,
            @RequestBody UpdateRoleRequest request) throws Exception {
        RoleResponse response = roleCharacterService.updateRole(id, request);
        return ResponseEntity.ok(response);
    }

    // Deactivate/activate role
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<RoleResponse> deactivateRole(
            @PathVariable Long id,
            @RequestBody DeactivateRoleRequest request) {

        RoleResponse response = roleCharacterService.deactivateRole(id, request);
        return ResponseEntity.ok(response);
    }

    // Hard delete role
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) throws Exception {
        roleCharacterService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }

    // Get role by ID
    @GetMapping("/{id}")
    public ResponseEntity<RoleResponse> getRoleById(@PathVariable Long id) {
        return roleCharacterService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get all roles
    @GetMapping
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        List<RoleResponse> roles = roleCharacterService.findAll();
        return ResponseEntity.ok(roles);
    }

    // Get active roles only
    @GetMapping("/active")
    public ResponseEntity<List<RoleResponse>> getActiveRoles() {
        List<RoleResponse> roles = roleCharacterService.findActiveRoles();
        return ResponseEntity.ok(roles);
    }

    // Upload role icon
    // POST /api/roles/{id}/upload-icon
    @PostMapping("/{id}/upload-icon")
    public ResponseEntity<RoleResponse> uploadRoleIcon(
            @PathVariable Long id,
            @RequestParam("icon") MultipartFile iconFile) throws Exception {
        RoleResponse response = roleCharacterService.updateRoleIcon(id, iconFile);
        return ResponseEntity.ok(response);
    }

    // Serve role icon files (public)
    // GET /api/roles/icon/{filename}
    @GetMapping("/icon/{filename:.+}")
    public ResponseEntity<Resource> serveRoleIconFile(@PathVariable String filename) {
        try {
            Path filePath = roleStoragePath.resolve(filename).normalize();

            // Security check: ensure the file is within the storage directory
            if (!filePath.startsWith(roleStoragePath)) {
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