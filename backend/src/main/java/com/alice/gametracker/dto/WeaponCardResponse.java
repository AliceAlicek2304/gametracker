package com.alice.gametracker.dto;

// Simplified DTO for displaying weapon cards on public weapon listing page
public class WeaponCardResponse {

    private Long id;
    private String name;
    private String type;
    private String imageUrl;
    private Integer rarity;

    // Constructors
    public WeaponCardResponse() {}

    public WeaponCardResponse(Long id, String name, String type, String imageUrl, Integer rarity) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.imageUrl = imageUrl;
        this.rarity = rarity;
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getRarity() {
        return rarity;
    }

    public void setRarity(Integer rarity) {
        this.rarity = rarity;
    }
}
