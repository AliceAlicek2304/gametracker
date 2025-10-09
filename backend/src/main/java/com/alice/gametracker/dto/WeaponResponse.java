package com.alice.gametracker.dto;

import java.time.LocalDateTime;

public class WeaponResponse {

    private Long id;
    private String weaponType;
    private String name;
    private String imageUrl;
    private String description;
    private String mainStats;
    private String subStats;
    private String subStatsType;
    private String skill;
    private Integer rarity;
    private Boolean isActive;
    private LocalDateTime createdDate;

    public WeaponResponse() {}

    public WeaponResponse(Long id, String weaponType, String name, String imageUrl, String description,
                          String mainStats, String subStats, String subStatsType, String skill, Integer rarity, Boolean isActive, LocalDateTime createdDate) {
        this.id = id;
        this.weaponType = weaponType;
        this.name = name;
        this.imageUrl = imageUrl;
        this.description = description;
        this.mainStats = mainStats;
        this.subStats = subStats;
        this.subStatsType = subStatsType;
    this.skill = skill;
        this.rarity = rarity;
        this.isActive = isActive;
        this.createdDate = createdDate;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }

    public Integer getRarity() { return rarity; }
    public void setRarity(Integer rarity) { this.rarity = rarity; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}
