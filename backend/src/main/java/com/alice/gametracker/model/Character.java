package com.alice.gametracker.model;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "characters")
public class Character {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int rarity;

    @ManyToMany
    @JoinTable(
        name = "character_role_characters",
        joinColumns = @JoinColumn(name = "character_id"),
        inverseJoinColumns = @JoinColumn(name = "role_character_id")
    )
    private List<RoleCharacter> roles;      // Một nhân vật có thể có nhiều Role

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Element element;       // Enum

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WeaponType weaponType; // Enum

    @Column(nullable = false)
    private boolean isActive = true;

    @Column(length = 1000)
    private String description;

    private String imageUrl;       // Link ảnh nhân vật

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "stats_id")
    private Stats stats;           // One-to-One

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "skill_id")
    private Skill skill;           // One-to-One

    @Column(nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    // Constructors
    public Character() {}

    public Character(String name, int rarity, List<RoleCharacter> roles, Element element, WeaponType weaponType, String description, String imageUrl, Stats stats, Skill skill) {
        this.name = name;
        this.rarity = rarity;
        this.roles = roles;
        this.element = element;
        this.weaponType = weaponType;
        this.description = description;
        this.imageUrl = imageUrl;
        this.stats = stats;
        this.skill = skill;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getRarity() { return rarity; }
    public void setRarity(int rarity) { this.rarity = rarity; }

    public List<RoleCharacter> getRoles() { return roles; }
    public void setRoles(List<RoleCharacter> roles) { this.roles = roles; }

    public Element getElement() { return element; }
    public void setElement(Element element) { this.element = element; }

    public WeaponType getWeaponType() { return weaponType; }
    public void setWeaponType(WeaponType weaponType) { this.weaponType = weaponType; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Stats getStats() { return stats; }
    public void setStats(Stats stats) { this.stats = stats; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}