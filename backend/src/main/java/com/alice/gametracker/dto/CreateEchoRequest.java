package com.alice.gametracker.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateEchoRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String imageUrl;
    private String description;

    @NotNull(message = "Cost is required")
    private Integer cost;

    private String skill;
    private List<Long> setEchoIds; // FK references to multiple set echoes

    public CreateEchoRequest() {}

    // Getters/Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getCost() { return cost; }
    public void setCost(Integer cost) { this.cost = cost; }

    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }

    public List<Long> getSetEchoIds() { return setEchoIds; }
    public void setSetEchoIds(List<Long> setEchoIds) { this.setEchoIds = setEchoIds; }
}
