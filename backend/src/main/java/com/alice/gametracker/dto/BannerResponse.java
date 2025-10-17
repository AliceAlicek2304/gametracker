package com.alice.gametracker.dto;

import java.time.LocalDateTime;

public class BannerResponse {
    private Long id;
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String bannerType; // CHARACTER or WEAPON
    
    // Character banner fields
    private Long featured5StarCharacterId;
    private String featured5StarCharacterName;
    private String featured5StarCharacterImageUrl;
    private Long featured4StarCharacter1Id;
    private String featured4StarCharacter1Name;
    private String featured4StarCharacter1ImageUrl;
    private Long featured4StarCharacter2Id;
    private String featured4StarCharacter2Name;
    private String featured4StarCharacter2ImageUrl;
    private Long featured4StarCharacter3Id;
    private String featured4StarCharacter3Name;
    private String featured4StarCharacter3ImageUrl;
    
    // Weapon banner fields
    private Long featured5StarWeaponId;
    private String featured5StarWeaponName;
    private String featured5StarWeaponImageUrl;
    private Long featured4StarWeapon1Id;
    private String featured4StarWeapon1Name;
    private String featured4StarWeapon1ImageUrl;
    private Long featured4StarWeapon2Id;
    private String featured4StarWeapon2Name;
    private String featured4StarWeapon2ImageUrl;
    private Long featured4StarWeapon3Id;
    private String featured4StarWeapon3Name;
    private String featured4StarWeapon3ImageUrl;
    
    private String status;
    private boolean isActive;
    private LocalDateTime createdDate;

    // Constructor
    public BannerResponse() {}

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

    public String getFeatured5StarCharacterName() {
        return featured5StarCharacterName;
    }

    public void setFeatured5StarCharacterName(String featured5StarCharacterName) {
        this.featured5StarCharacterName = featured5StarCharacterName;
    }

    public String getFeatured5StarCharacterImageUrl() {
        return featured5StarCharacterImageUrl;
    }

    public void setFeatured5StarCharacterImageUrl(String featured5StarCharacterImageUrl) {
        this.featured5StarCharacterImageUrl = featured5StarCharacterImageUrl;
    }

    public Long getFeatured4StarCharacter1Id() {
        return featured4StarCharacter1Id;
    }

    public void setFeatured4StarCharacter1Id(Long featured4StarCharacter1Id) {
        this.featured4StarCharacter1Id = featured4StarCharacter1Id;
    }

    public String getFeatured4StarCharacter1Name() {
        return featured4StarCharacter1Name;
    }

    public void setFeatured4StarCharacter1Name(String featured4StarCharacter1Name) {
        this.featured4StarCharacter1Name = featured4StarCharacter1Name;
    }

    public String getFeatured4StarCharacter1ImageUrl() {
        return featured4StarCharacter1ImageUrl;
    }

    public void setFeatured4StarCharacter1ImageUrl(String featured4StarCharacter1ImageUrl) {
        this.featured4StarCharacter1ImageUrl = featured4StarCharacter1ImageUrl;
    }

    public Long getFeatured4StarCharacter2Id() {
        return featured4StarCharacter2Id;
    }

    public void setFeatured4StarCharacter2Id(Long featured4StarCharacter2Id) {
        this.featured4StarCharacter2Id = featured4StarCharacter2Id;
    }

    public String getFeatured4StarCharacter2Name() {
        return featured4StarCharacter2Name;
    }

    public void setFeatured4StarCharacter2Name(String featured4StarCharacter2Name) {
        this.featured4StarCharacter2Name = featured4StarCharacter2Name;
    }

    public String getFeatured4StarCharacter2ImageUrl() {
        return featured4StarCharacter2ImageUrl;
    }

    public void setFeatured4StarCharacter2ImageUrl(String featured4StarCharacter2ImageUrl) {
        this.featured4StarCharacter2ImageUrl = featured4StarCharacter2ImageUrl;
    }

    public Long getFeatured4StarCharacter3Id() {
        return featured4StarCharacter3Id;
    }

    public void setFeatured4StarCharacter3Id(Long featured4StarCharacter3Id) {
        this.featured4StarCharacter3Id = featured4StarCharacter3Id;
    }

    public String getFeatured4StarCharacter3Name() {
        return featured4StarCharacter3Name;
    }

    public void setFeatured4StarCharacter3Name(String featured4StarCharacter3Name) {
        this.featured4StarCharacter3Name = featured4StarCharacter3Name;
    }

    public String getFeatured4StarCharacter3ImageUrl() {
        return featured4StarCharacter3ImageUrl;
    }

    public void setFeatured4StarCharacter3ImageUrl(String featured4StarCharacter3ImageUrl) {
        this.featured4StarCharacter3ImageUrl = featured4StarCharacter3ImageUrl;
    }

    public String getBannerType() {
        return bannerType;
    }

    public void setBannerType(String bannerType) {
        this.bannerType = bannerType;
    }

    // Weapon getters/setters
    public Long getFeatured5StarWeaponId() {
        return featured5StarWeaponId;
    }

    public void setFeatured5StarWeaponId(Long featured5StarWeaponId) {
        this.featured5StarWeaponId = featured5StarWeaponId;
    }

    public String getFeatured5StarWeaponName() {
        return featured5StarWeaponName;
    }

    public void setFeatured5StarWeaponName(String featured5StarWeaponName) {
        this.featured5StarWeaponName = featured5StarWeaponName;
    }

    public String getFeatured5StarWeaponImageUrl() {
        return featured5StarWeaponImageUrl;
    }

    public void setFeatured5StarWeaponImageUrl(String featured5StarWeaponImageUrl) {
        this.featured5StarWeaponImageUrl = featured5StarWeaponImageUrl;
    }

    public Long getFeatured4StarWeapon1Id() {
        return featured4StarWeapon1Id;
    }

    public void setFeatured4StarWeapon1Id(Long featured4StarWeapon1Id) {
        this.featured4StarWeapon1Id = featured4StarWeapon1Id;
    }

    public String getFeatured4StarWeapon1Name() {
        return featured4StarWeapon1Name;
    }

    public void setFeatured4StarWeapon1Name(String featured4StarWeapon1Name) {
        this.featured4StarWeapon1Name = featured4StarWeapon1Name;
    }

    public String getFeatured4StarWeapon1ImageUrl() {
        return featured4StarWeapon1ImageUrl;
    }

    public void setFeatured4StarWeapon1ImageUrl(String featured4StarWeapon1ImageUrl) {
        this.featured4StarWeapon1ImageUrl = featured4StarWeapon1ImageUrl;
    }

    public Long getFeatured4StarWeapon2Id() {
        return featured4StarWeapon2Id;
    }

    public void setFeatured4StarWeapon2Id(Long featured4StarWeapon2Id) {
        this.featured4StarWeapon2Id = featured4StarWeapon2Id;
    }

    public String getFeatured4StarWeapon2Name() {
        return featured4StarWeapon2Name;
    }

    public void setFeatured4StarWeapon2Name(String featured4StarWeapon2Name) {
        this.featured4StarWeapon2Name = featured4StarWeapon2Name;
    }

    public String getFeatured4StarWeapon2ImageUrl() {
        return featured4StarWeapon2ImageUrl;
    }

    public void setFeatured4StarWeapon2ImageUrl(String featured4StarWeapon2ImageUrl) {
        this.featured4StarWeapon2ImageUrl = featured4StarWeapon2ImageUrl;
    }

    public Long getFeatured4StarWeapon3Id() {
        return featured4StarWeapon3Id;
    }

    public void setFeatured4StarWeapon3Id(Long featured4StarWeapon3Id) {
        this.featured4StarWeapon3Id = featured4StarWeapon3Id;
    }

    public String getFeatured4StarWeapon3Name() {
        return featured4StarWeapon3Name;
    }

    public void setFeatured4StarWeapon3Name(String featured4StarWeapon3Name) {
        this.featured4StarWeapon3Name = featured4StarWeapon3Name;
    }

    public String getFeatured4StarWeapon3ImageUrl() {
        return featured4StarWeapon3ImageUrl;
    }

    public void setFeatured4StarWeapon3ImageUrl(String featured4StarWeapon3ImageUrl) {
        this.featured4StarWeapon3ImageUrl = featured4StarWeapon3ImageUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
}
