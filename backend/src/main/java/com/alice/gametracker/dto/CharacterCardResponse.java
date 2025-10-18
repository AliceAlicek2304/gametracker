package com.alice.gametracker.dto;

// Simplified DTO for displaying character cards on public character listing page
public class CharacterCardResponse {

    private Long id;
    private String name;
    private String element;
    private String weaponType;
    private String imageUrl;
    private Integer rarity;

    // Constructors
    public CharacterCardResponse() {}

    public CharacterCardResponse(Long id, String name, String element, String weaponType, 
                                String imageUrl, Integer rarity) {
        this.id = id;
        this.name = name;
        this.element = element;
        this.weaponType = weaponType;
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
