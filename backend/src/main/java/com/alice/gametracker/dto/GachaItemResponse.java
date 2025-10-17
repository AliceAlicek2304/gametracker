package com.alice.gametracker.dto;

public class GachaItemResponse {
    private Long id;
    private String name;
    private String imageUrl;
    private int rarity;
    private String type; // "CHARACTER" or "WEAPON"
    private String element;
    private String weaponType;
    private boolean isNew;
    private boolean isFeatured;

    public GachaItemResponse() {
    }

    public GachaItemResponse(Long id, String name, String imageUrl, int rarity, String type, String element, String weaponType, boolean isNew, boolean isFeatured) {
        this.id = id;
        this.name = name;
        this.imageUrl = imageUrl;
        this.rarity = rarity;
        this.type = type;
        this.element = element;
        this.weaponType = weaponType;
        this.isNew = isNew;
        this.isFeatured = isFeatured;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public int getRarity() {
        return rarity;
    }

    public void setRarity(int rarity) {
        this.rarity = rarity;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
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

    public boolean isNew() {
        return isNew;
    }

    public void setNew(boolean aNew) {
        isNew = aNew;
    }

    public boolean isFeatured() {
        return isFeatured;
    }

    public void setFeatured(boolean featured) {
        isFeatured = featured;
    }
}
