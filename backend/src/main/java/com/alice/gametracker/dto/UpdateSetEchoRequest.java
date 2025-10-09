package com.alice.gametracker.dto;

public class UpdateSetEchoRequest {
    private String name;
    private String description;
    private String skill;
    private String icon;

    public UpdateSetEchoRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}
