package com.alice.gametracker.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "weapons")
public class Weapon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WeaponType weaponType;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String imageUrl;

    @Column(columnDefinition = "LONGTEXT")
    private String description;

    @Column(length = 200)
    private String mainStats;

    @Column(length = 200)
    private String subStats;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private SubStatsType subStatsType;

    @Column(columnDefinition = "LONGTEXT")
    private String skill;

    @Column(nullable = false, columnDefinition = "INT DEFAULT 1")
    private int rarity = 1;

    @Column(nullable = false)
    private boolean isActive = true;

    @Column(nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    // Constructors
    public Weapon() {}

    public Weapon(WeaponType weaponType, String name, String imageUrl, String description,
                  String mainStats, String subStats, SubStatsType subStatsType, String skill, int rarity) {
        this.weaponType = weaponType;
        this.name = name;
        this.imageUrl = imageUrl;
        this.description = description;
        this.mainStats = mainStats;
        this.subStats = subStats;
        this.subStatsType = subStatsType;
        this.skill = skill;
        this.rarity = rarity;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public WeaponType getWeaponType() { return weaponType; }
    public void setWeaponType(WeaponType weaponType) { this.weaponType = weaponType; }

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

    public SubStatsType getSubStatsType() { return subStatsType; }
    public void setSubStatsType(SubStatsType subStatsType) { this.subStatsType = subStatsType; }

    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }

    public int getRarity() { return rarity; }
    public void setRarity(int rarity) { this.rarity = rarity; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}