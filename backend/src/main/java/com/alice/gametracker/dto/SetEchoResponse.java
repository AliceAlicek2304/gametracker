package com.alice.gametracker.dto;

import java.time.LocalDateTime;

public class SetEchoResponse {
    private Long id;
    private String name;
    private String description;
    private String skill;
    private String icon;
    private Boolean isActive;
    private LocalDateTime createdDate;

    public SetEchoResponse() {}

    public SetEchoResponse(Long id, String name, String description, String skill, String icon, Boolean isActive, LocalDateTime createdDate) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.skill = skill;
        this.icon = icon;
        this.isActive = isActive;
        this.createdDate = createdDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}
