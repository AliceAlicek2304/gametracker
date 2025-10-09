package com.alice.gametracker.dto;

import java.time.LocalDateTime;

public class RoleResponse {

    private Long id;
    private String icon;
    private String name;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdDate;

    // Constructors
    public RoleResponse() {}

    public RoleResponse(Long id, String icon, String name, String description, Boolean isActive, LocalDateTime createdDate) {
        this.id = id;
        this.icon = icon;
        this.name = name;
        this.description = description;
        this.isActive = isActive;
        this.createdDate = createdDate;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
}