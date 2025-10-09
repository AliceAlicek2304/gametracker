package com.alice.gametracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateWeaponRequest {

    @NotNull(message = "Weapon type is required")
    private String weaponType;

    @NotBlank(message = "Weapon name is required")
    private String name;

    private String imageUrl;
    private String description;
    private String mainStats;
    private String subStats;
    private String subStatsType;
    private String r1;
    private String r5;
    private String skill;
    private Integer rarity;

    public CreateWeaponRequest() {}

    // Getters/Setters
    public String getWeaponType() { return weaponType; }
    public void setWeaponType(String weaponType) { this.weaponType = weaponType; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getMainStats() { return mainStats; }
    public void setMainStats(String mainStats) { this.mainStats = mainStats; }

    public String getSubStats() { return subStats; }
    public void setSubStats(String subStats) { this.subStats = subStats; }

    public String getSubStatsType() { return subStatsType; }
    public void setSubStatsType(String subStatsType) { this.subStatsType = subStatsType; }

    public String getR1() { return r1; }
    public void setR1(String r1) { this.r1 = r1; }

    public String getR5() { return r5; }
    public void setR5(String r5) { this.r5 = r5; }

    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }

    public Integer getRarity() { return rarity; }
    public void setRarity(Integer rarity) { this.rarity = rarity; }
}
