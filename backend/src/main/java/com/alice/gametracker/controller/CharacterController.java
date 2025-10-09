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

import com.alice.gametracker.dto.CharacterResponse;
import com.alice.gametracker.dto.CreateCharacterRequest;
import com.alice.gametracker.dto.DeactivateCharacterRequest;
import com.alice.gametracker.dto.UpdateCharacterRequest;
import com.alice.gametracker.service.CharacterService;

import jakarta.annotation.PostConstruct;

@RestController
@RequestMapping("/api/characters")
public class CharacterController {

    @Autowired
    private CharacterService characterService;

    @Value("${app.character.storage.location}")
    private String characterStorageLocation;

    @Value("${app.character.url.pattern}")
    private String characterUrlPattern;

    private Path characterStoragePath;

    @PostConstruct
    public void init() {
        this.characterStoragePath = Paths.get(characterStorageLocation).toAbsolutePath().normalize();
    }

    // Create new character
    @PostMapping(consumes = "application/json")
    public ResponseEntity<CharacterResponse> createCharacter(@RequestBody CreateCharacterRequest request) throws Exception {
        CharacterResponse response = characterService.createCharacter(request, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Update character (JSON only). Image uploads handled by POST /{id}/upload-image
    @PutMapping(path = "/{id}", consumes = "application/json")
    public ResponseEntity<CharacterResponse> updateCharacter(
            @PathVariable Long id,
            @RequestBody UpdateCharacterRequest request) throws Exception {
        CharacterResponse response = characterService.updateCharacter(id, request);
        return ResponseEntity.ok(response);
    }

    // Deactivate/activate character
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<CharacterResponse> deactivateCharacter(
            @PathVariable Long id,
            @RequestBody DeactivateCharacterRequest request) {

        CharacterResponse response = characterService.deactivateCharacter(id, request);
        return ResponseEntity.ok(response);
    }

    // Hard delete character
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCharacter(@PathVariable Long id) throws Exception {
        characterService.deleteCharacter(id);
        return ResponseEntity.noContent().build();
    }

    // Get character by ID
    @GetMapping("/{id}")
    public ResponseEntity<CharacterResponse> getCharacterById(@PathVariable Long id) {
        Optional<CharacterResponse> character = characterService.findCharacterById(id);
        return character.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }

    // Get all characters
    @GetMapping
    public ResponseEntity<List<CharacterResponse>> getAllCharacters() {
        List<CharacterResponse> characters = characterService.findAllCharacters();
        return ResponseEntity.ok(characters);
    }

    // Get active characters only
    @GetMapping("/active")
    public ResponseEntity<List<CharacterResponse>> getActiveCharacters() {
        List<CharacterResponse> characters = characterService.findActiveCharacters();
        return ResponseEntity.ok(characters);
    }

    // Upload character image
    // POST /api/characters/{id}/upload-image
    @PostMapping("/{id}/upload-image")
    public ResponseEntity<CharacterResponse> uploadCharacterImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile imageFile) throws Exception {
        CharacterResponse response = characterService.updateCharacterImage(id, imageFile);
        return ResponseEntity.ok(response);
    }

    // Serve character image files (public)
    // GET /api/characters/image/{filename}
    @GetMapping("/image/{filename:.+}")
    public ResponseEntity<Resource> serveCharacterImage(@PathVariable String filename) {
        try {
            Path filePath = characterStoragePath.resolve(filename).normalize();

            // Security check: ensure the file is within the storage directory
            if (!filePath.startsWith(characterStoragePath)) {
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