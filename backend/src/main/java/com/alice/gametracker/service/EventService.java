package com.alice.gametracker.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.alice.gametracker.dto.CreateEventRequest;
import com.alice.gametracker.dto.EventResponse;
import com.alice.gametracker.dto.UpdateEventRequest;
import com.alice.gametracker.model.Event;
import com.alice.gametracker.repository.EventRepository;

@Service
@Transactional
public class EventService {
    private static final Logger log = LoggerFactory.getLogger(EventService.class);

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public EventResponse createEvent(CreateEventRequest request, MultipartFile imageFile) throws Exception {
        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setStartAt(request.getStartAt());
        event.setEndAt(request.getEndAt());
        event.setLink(request.getLink());
        event.setVersion(request.getVersion() != null ? request.getVersion() : "default");
        event.setMetadata(request.getMetadata());
        if (request.getIsActive() == null) {
            event.setActive(true);
        } else {
            event.setActive(request.getIsActive());
        }
        LocalDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDateTime();
        event.setCreatedAt(now);
        event.setUpdatedAt(now);

        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = fileStorageService.storeEventImage(imageFile);
            event.setImageUrl(imageUrl);
        }

        Event saved = eventRepository.save(event);
        return convertToResponse(saved);
    }

    public EventResponse updateEvent(Long id, UpdateEventRequest request, MultipartFile imageFile) throws Exception {
        Optional<Event> optional = eventRepository.findById(id);
        if (optional.isEmpty())
            throw new RuntimeException("Event not found");

        Event event = optional.get();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setStartAt(request.getStartAt());
        event.setEndAt(request.getEndAt());
        event.setLink(request.getLink());
        if (request.getVersion() != null)
            event.setVersion(request.getVersion());
        event.setMetadata(request.getMetadata());
        if (request.getIsActive() != null) {
            event.setActive(request.getIsActive());
        }
        event.setUpdatedAt(ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDateTime());

        if (imageFile != null && !imageFile.isEmpty()) {
            // Delete old image if present
            if (event.getImageUrl() != null) {
                try {
                    fileStorageService.deleteFile(event.getImageUrl());
                } catch (IOException ex) {
                    log.warn("Failed to delete old event image: {}", ex.getMessage());
                }
            }
            String imageUrl = fileStorageService.storeEventImage(imageFile);
            event.setImageUrl(imageUrl);
        }

        Event updated = eventRepository.save(event);
        return convertToResponse(updated);
    }

    /**
     * Update only the image for an event. This avoids touching other fields which may be
     * non-nullable in the database when callers only want to upload an image.
     */
    public EventResponse uploadEventImage(Long id, MultipartFile imageFile) throws Exception {
        Optional<Event> optional = eventRepository.findById(id);
        if (optional.isEmpty())
            throw new RuntimeException("Event not found");

        Event event = optional.get();
        if (imageFile != null && !imageFile.isEmpty()) {
            if (event.getImageUrl() != null) {
                try {
                    fileStorageService.deleteFile(event.getImageUrl());
                } catch (IOException ex) {
                    log.warn("Failed to delete old event image: {}", ex.getMessage());
                }
            }
            String imageUrl = fileStorageService.storeEventImage(imageFile);
            event.setImageUrl(imageUrl);
            event.setUpdatedAt(ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDateTime());
        }

        Event updated = eventRepository.save(event);
        return convertToResponse(updated);
    }

    public void deleteEvent(Long id) throws Exception {
        Optional<Event> optional = eventRepository.findById(id);
        if (optional.isEmpty())
            throw new RuntimeException("Event not found");
        Event event = optional.get();
        if (event.getImageUrl() != null) {
            try {
                fileStorageService.deleteFile(event.getImageUrl());
            } catch (IOException ex) {
                log.warn("Failed to delete event image: {}", ex.getMessage());
            }
        }
        eventRepository.deleteById(id);
    }

    public Optional<EventResponse> findByIdResponse(Long id) {
        return eventRepository.findById(id).map(this::convertToResponse);
    }

    public List<EventResponse> findAllResponses() {
        return eventRepository.findAll().stream().map(this::convertToResponse).toList();
    }

    /**
     * Return only events that are marked active and whose endAt is in the future (or null).
     * This implements the "currently active" definition: now < endAt (if endAt present) and isActive == true.
     */
    public List<EventResponse> findActiveResponses() {
        LocalDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDateTime();
        return eventRepository.findByIsActive(true).stream()
                .filter(e -> e.getEndAt() == null || now.isBefore(e.getEndAt()))
                .map(this::convertToResponse)
                .toList();
    }

    public EventResponse deactivateEvent(Long id, boolean active) {
        Optional<Event> optional = eventRepository.findById(id);
        if (optional.isEmpty())
            throw new RuntimeException("Event not found");
        Event e = optional.get();
        e.setActive(active);
        Event updated = eventRepository.save(e);
        return convertToResponse(updated);
    }

    private EventResponse convertToResponse(Event e) {
        return new EventResponse(
                e.getId(),
                e.getTitle(),
                e.getDescription(),
                e.getStartAt(),
                e.getEndAt(),
                e.getImageUrl(),
                e.getLink(),
                e.getVersion(),
                e.getMetadata(),
                e.isActive(),
                e.getCreatedAt());
    }

    // Convenience
    public Event save(Event e) {
        return eventRepository.save(e);
    }

    public boolean existsById(Long id) {
        return eventRepository.existsById(id);
    }
}
