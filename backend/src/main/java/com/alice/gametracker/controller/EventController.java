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

import com.alice.gametracker.dto.CreateEventRequest;
import com.alice.gametracker.dto.EventResponse;
import com.alice.gametracker.dto.UpdateEventRequest;
import com.alice.gametracker.service.EventService;

import jakarta.annotation.PostConstruct;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @Value("${app.event.storage.location:uploads/event/}")
    private String eventStorageLocation;

    @Value("${app.event.url.pattern:/api/events/image}")
    private String eventUrlPattern;

    private Path eventStoragePath;

    @PostConstruct
    public void init() {
        this.eventStoragePath = Paths.get(eventStorageLocation).toAbsolutePath().normalize();
    }

    // Public: list all events
    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        List<EventResponse> resp = eventService.findAllResponses();
        return ResponseEntity.ok(resp);
    }

    // Public: active events
    @GetMapping("/active")
    public ResponseEntity<List<EventResponse>> getActiveEvents() {
        List<EventResponse> resp = eventService.findActiveResponses();
        return ResponseEntity.ok(resp);
    }

    // Public: get by id
    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable Long id) {
        Optional<EventResponse> opt = eventService.findByIdResponse(id);
        return opt.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // Admin: create event (JSON)
    @PostMapping(consumes = "application/json")
    public ResponseEntity<EventResponse> createEvent(@RequestBody CreateEventRequest request) throws Exception {
        EventResponse response = eventService.createEvent(request, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Admin: update event (JSON)
    @PutMapping(path = "/{id}", consumes = "application/json")
    public ResponseEntity<EventResponse> updateEvent(@PathVariable Long id, @RequestBody UpdateEventRequest request) throws Exception {
        EventResponse response = eventService.updateEvent(id, request, null);
        return ResponseEntity.ok(response);
    }

    // Admin: deactivate/activate
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<EventResponse> deactivateEvent(@PathVariable Long id, @RequestBody UpdateEventRequest request) {
        boolean active = request.getIsActive() != null ? request.getIsActive() : false;
        EventResponse response = eventService.deactivateEvent(id, active);
        return ResponseEntity.ok(response);
    }

    // Admin: delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) throws Exception {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    // Admin: upload image for event
    @PostMapping("/{id}/upload-image")
    public ResponseEntity<EventResponse> uploadEventImage(@PathVariable Long id, @RequestParam("image") MultipartFile imageFile) throws Exception {
        EventResponse response = eventService.uploadEventImage(id, imageFile);
        return ResponseEntity.ok(response);
    }

    // Serve event image files (public)
    @GetMapping("/image/{filename:.+}")
    public ResponseEntity<Resource> serveEventImage(@PathVariable String filename) {
        try {
            Path filePath = eventStoragePath.resolve(filename).normalize();

            if (!filePath.startsWith(eventStoragePath)) {
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
