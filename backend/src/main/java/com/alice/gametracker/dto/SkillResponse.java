package com.alice.gametracker.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.databind.JsonNode;

public class SkillResponse {

    private Long id;
    private JsonNode skill;
    private Boolean isActive;
    private LocalDateTime createdDate;

    public SkillResponse() {}

    public SkillResponse(Long id, JsonNode skill, Boolean isActive, LocalDateTime createdDate) {
        this.id = id;
        this.skill = skill;
        this.isActive = isActive;
        this.createdDate = createdDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public JsonNode getSkill() { return skill; }
    public void setSkill(JsonNode skill) { this.skill = skill; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}