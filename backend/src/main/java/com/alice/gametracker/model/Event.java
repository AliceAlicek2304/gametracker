package com.alice.gametracker.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(name = "start_at", nullable = false, columnDefinition = "DATETIME2")
    private LocalDateTime startDate;

    @Column(name = "end_at", nullable = true, columnDefinition = "DATETIME2")
    private LocalDateTime endDate;

    @Column(length = 2000)
    private String imageUrl;

    @Column(length = 2000)
    private String link;

    @Column(length = 100)
    private String version = "default";

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String metadata;

    @Column(nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, columnDefinition = "DATETIME2")
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "updated_at", nullable = true, columnDefinition = "DATETIME2")
    private LocalDateTime updatedDate;

    public Event() {
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getStartAt() {
        return startDate;
    }

    public void setStartAt(LocalDateTime startAt) {
        this.startDate = startAt;
    }

    public LocalDateTime getEndAt() {
        return endDate;
    }

    public void setEndAt(LocalDateTime endAt) {
        this.endDate = endAt;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdDate;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdDate = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedDate;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedDate = updatedAt;
    }

}
