package com.alice.gametracker.dto;

import java.time.LocalDateTime;

public class EchoResponse {

    private Long id;
    private String imageUrl;
    private String name;
    private String description;
    private Integer cost;
    private String skill;
    private Long setEchoId;
    private Boolean isActive;
    private LocalDateTime createdDate;

    public EchoResponse() {}

    public EchoResponse(Long id, String imageUrl, String name, String description,
                        Integer cost, String skill, Long setEchoId, Boolean isActive, LocalDateTime createdDate) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.name = name;
        this.description = description;
        this.cost = cost;
        this.skill = skill;
        this.setEchoId = setEchoId;
        this.isActive = isActive;
        this.createdDate = createdDate;
    }

    // Getters/Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getCost() { return cost; }
    public void setCost(Integer cost) { this.cost = cost; }

    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }

    public Long getSetEchoId() { return setEchoId; }
    public void setSetEchoId(Long setEchoId) { this.setEchoId = setEchoId; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}
