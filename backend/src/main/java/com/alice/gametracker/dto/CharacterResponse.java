package com.alice.gametracker.dto;

import java.time.LocalDateTime;
import java.util.List;

public class CharacterResponse {

    private Long id;
    private String name;
    private Integer rarity;
    private List<RoleResponse> roles;
    private String element;
    private String weaponType;
    private Boolean isActive;
    private String description;
    private String imageUrl;
    private StatsResponse stats;
    private SkillResponse skill;
    private LocalDateTime createdDate;

    // Constructors
    public CharacterResponse() {}

    public CharacterResponse(Long id, String name, Integer rarity, List<RoleResponse> roles,
                           String element, String weaponType, Boolean isActive, String description,
                           String imageUrl, StatsResponse stats, SkillResponse skill, LocalDateTime createdDate) {
        this.id = id;
        this.name = name;
        this.rarity = rarity;
        this.roles = roles;
        this.element = element;
        this.weaponType = weaponType;
        this.isActive = isActive;
        this.description = description;
        this.imageUrl = imageUrl;
        this.stats = stats;
        this.skill = skill;
        this.createdDate = createdDate;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getRarity() {
        return rarity;
    }

    public void setRarity(Integer rarity) {
        this.rarity = rarity;
    }

    public List<RoleResponse> getRoles() {
        return roles;
    }

    public void setRoles(List<RoleResponse> roles) {
        this.roles = roles;
    }

    public String getElement() {
        return element;
    }

    public void setElement(String element) {
        this.element = element;
    }

    public String getWeaponType() {
        return weaponType;
    }

    public void setWeaponType(String weaponType) {
        this.weaponType = weaponType;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public StatsResponse getStats() {
        return stats;
    }

    public void setStats(StatsResponse stats) {
        this.stats = stats;
    }

    public SkillResponse getSkill() {
        return skill;
    }

    public void setSkill(SkillResponse skill) {
        this.skill = skill;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
}