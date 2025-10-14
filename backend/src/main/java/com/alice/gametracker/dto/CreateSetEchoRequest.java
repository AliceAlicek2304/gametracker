package com.alice.gametracker.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateSetEchoRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String skill;
    private String icon;

    public CreateSetEchoRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}
