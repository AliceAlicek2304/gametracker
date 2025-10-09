package com.alice.gametracker.dto;

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
    private Long setEchoId; // FK reference

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

    public Long getSetEchoId() { return setEchoId; }
    public void setSetEchoId(Long setEchoId) { this.setEchoId = setEchoId; }
}
