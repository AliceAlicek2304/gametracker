package com.alice.gametracker.dto;

import java.time.LocalDateTime;
import java.util.List;

public class EchoResponse {

    private Long id;
    private String imageUrl;
    private String name;
    private String description;
    private Integer cost;
    private String skill;
    private List<Long> setEchoIds;
    private Boolean isActive;
    private LocalDateTime createdDate;

    public EchoResponse() {}

    public EchoResponse(Long id, String imageUrl, String name, String description,
                        Integer cost, String skill, List<Long> setEchoIds, Boolean isActive, LocalDateTime createdDate) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.name = name;
        this.description = description;
        this.cost = cost;
        this.skill = skill;
        this.setEchoIds = setEchoIds;
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

    public List<Long> getSetEchoIds() { return setEchoIds; }
    public void setSetEchoIds(List<Long> setEchoIds) { this.setEchoIds = setEchoIds; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}
