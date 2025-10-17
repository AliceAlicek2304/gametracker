package com.alice.gametracker.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateBannerRequest {
    
    @NotBlank(message = "Banner name is required")
    private String name;
    
    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;
    
    @NotNull(message = "End date is required")
    private LocalDateTime endDate;

    @NotNull(message = "Banner type is required")
    private String bannerType = "CHARACTER"; // CHARACTER or WEAPON
    
    // Character banner fields (nullable for weapon banners)
    private Long featured5StarCharacterId;
    private Long featured4StarCharacter1Id;
    private Long featured4StarCharacter2Id;
    private Long featured4StarCharacter3Id;

    // Weapon banner fields (nullable for character banners)
    private Long featured5StarWeaponId;
    private Long featured4StarWeapon1Id;
    private Long featured4StarWeapon2Id;
    private Long featured4StarWeapon3Id;

    private Boolean isActive = true; // Default to active

    // Constructors
    public CreateBannerRequest() {}

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public Long getFeatured5StarCharacterId() {
        return featured5StarCharacterId;
    }

    public void setFeatured5StarCharacterId(Long featured5StarCharacterId) {
        this.featured5StarCharacterId = featured5StarCharacterId;
    }

    public Long getFeatured4StarCharacter1Id() {
        return featured4StarCharacter1Id;
    }

    public void setFeatured4StarCharacter1Id(Long featured4StarCharacter1Id) {
        this.featured4StarCharacter1Id = featured4StarCharacter1Id;
    }

    public Long getFeatured4StarCharacter2Id() {
        return featured4StarCharacter2Id;
    }

    public void setFeatured4StarCharacter2Id(Long featured4StarCharacter2Id) {
        this.featured4StarCharacter2Id = featured4StarCharacter2Id;
    }

    public Long getFeatured4StarCharacter3Id() {
        return featured4StarCharacter3Id;
    }

    public void setFeatured4StarCharacter3Id(Long featured4StarCharacter3Id) {
        this.featured4StarCharacter3Id = featured4StarCharacter3Id;
    }

    public String getBannerType() {
        return bannerType;
    }

    public void setBannerType(String bannerType) {
        this.bannerType = bannerType;
    }

    public Long getFeatured5StarWeaponId() {
        return featured5StarWeaponId;
    }

    public void setFeatured5StarWeaponId(Long featured5StarWeaponId) {
        this.featured5StarWeaponId = featured5StarWeaponId;
    }

    public Long getFeatured4StarWeapon1Id() {
        return featured4StarWeapon1Id;
    }

    public void setFeatured4StarWeapon1Id(Long featured4StarWeapon1Id) {
        this.featured4StarWeapon1Id = featured4StarWeapon1Id;
    }

    public Long getFeatured4StarWeapon2Id() {
        return featured4StarWeapon2Id;
    }

    public void setFeatured4StarWeapon2Id(Long featured4StarWeapon2Id) {
        this.featured4StarWeapon2Id = featured4StarWeapon2Id;
    }

    public Long getFeatured4StarWeapon3Id() {
        return featured4StarWeapon3Id;
    }

    public void setFeatured4StarWeapon3Id(Long featured4StarWeapon3Id) {
        this.featured4StarWeapon3Id = featured4StarWeapon3Id;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
