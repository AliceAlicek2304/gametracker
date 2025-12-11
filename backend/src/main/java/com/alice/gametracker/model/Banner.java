    package com.alice.gametracker.model;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "banners")                                                                                                                                                                                                                                                
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BannerType bannerType = BannerType.CHARACTER;

    // === CHARACTER BANNER FIELDS ===
    // Featured 5-star character (Main character) - nullable for weapon banners
    @ManyToOne
    @JoinColumn(name = "featured_5star_character_id")
    private Character featured5StarCharacter;

    // First 4-star character - nullable for weapon banners
    @ManyToOne
    @JoinColumn(name = "featured_4star_character_1_id")
    private Character featured4StarCharacter1;

    // Second 4-star character - nullable for weapon banners
    @ManyToOne
    @JoinColumn(name = "featured_4star_character_2_id")
    private Character featured4StarCharacter2;

    // Third 4-star character - nullable for weapon banners
    @ManyToOne
    @JoinColumn(name = "featured_4star_character_3_id")
    private Character featured4StarCharacter3;

    // === WEAPON BANNER FIELDS ===
    // Featured 5-star weapon (Main weapon) - nullable for character banners
    @ManyToOne
    @JoinColumn(name = "featured_5star_weapon_id")
    private Weapon featured5StarWeapon;

    // First 4-star weapon - nullable for character banners
    @ManyToOne
    @JoinColumn(name = "featured_4star_weapon_1_id")
    private Weapon featured4StarWeapon1;

    // Second 4-star weapon - nullable for character banners
    @ManyToOne
    @JoinColumn(name = "featured_4star_weapon_2_id")
    private Weapon featured4StarWeapon2;

    // Third 4-star weapon - nullable for character banners
    @ManyToOne
    @JoinColumn(name = "featured_4star_weapon_3_id")
    private Weapon featured4StarWeapon3;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BannerStatus status = BannerStatus.UPCOMING;

    @Column(nullable = false)
    private boolean isActive = true;

    @Column(nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    // Constructors
    public Banner() {}

    public Banner(String name, LocalDateTime startDate, LocalDateTime endDate,
                  Character featured5StarCharacter, Character featured4StarCharacter1,
                  Character featured4StarCharacter2, Character featured4StarCharacter3) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.featured5StarCharacter = featured5StarCharacter;
        this.featured4StarCharacter1 = featured4StarCharacter1;
        this.featured4StarCharacter2 = featured4StarCharacter2;
        this.featured4StarCharacter3 = featured4StarCharacter3;
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

    public Character getFeatured5StarCharacter() {
        return featured5StarCharacter;
    }

    public void setFeatured5StarCharacter(Character featured5StarCharacter) {
        this.featured5StarCharacter = featured5StarCharacter;
    }

    public Character getFeatured4StarCharacter1() {
        return featured4StarCharacter1;
    }

    public void setFeatured4StarCharacter1(Character featured4StarCharacter1) {
        this.featured4StarCharacter1 = featured4StarCharacter1;
    }

    public Character getFeatured4StarCharacter2() {
        return featured4StarCharacter2;
    }

    public void setFeatured4StarCharacter2(Character featured4StarCharacter2) {
        this.featured4StarCharacter2 = featured4StarCharacter2;
    }

    public Character getFeatured4StarCharacter3() {
        return featured4StarCharacter3;
    }

    public void setFeatured4StarCharacter3(Character featured4StarCharacter3) {
        this.featured4StarCharacter3 = featured4StarCharacter3;
    }

    public BannerType getBannerType() {
        return bannerType;
    }

    public void setBannerType(BannerType bannerType) {
        this.bannerType = bannerType;
    }

    public Weapon getFeatured5StarWeapon() {
        return featured5StarWeapon;
    }

    public void setFeatured5StarWeapon(Weapon featured5StarWeapon) {
        this.featured5StarWeapon = featured5StarWeapon;
    }

    public Weapon getFeatured4StarWeapon1() {
        return featured4StarWeapon1;
    }

    public void setFeatured4StarWeapon1(Weapon featured4StarWeapon1) {
        this.featured4StarWeapon1 = featured4StarWeapon1;
    }

    public Weapon getFeatured4StarWeapon2() {
        return featured4StarWeapon2;
    }

    public void setFeatured4StarWeapon2(Weapon featured4StarWeapon2) {
        this.featured4StarWeapon2 = featured4StarWeapon2;
    }

    public Weapon getFeatured4StarWeapon3() {
        return featured4StarWeapon3;
    }

    public void setFeatured4StarWeapon3(Weapon featured4StarWeapon3) {
        this.featured4StarWeapon3 = featured4StarWeapon3;
    }

    public BannerStatus getStatus() {
        return status;
    }

    public void setStatus(BannerStatus status) {
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

    // Helper method to update status based on current time
    public void updateStatus() {
        // Use Vietnam timezone (UTC+7) since database stores Vietnam local time
        LocalDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDateTime();
        
        if (now.isBefore(startDate)) {
            this.status = BannerStatus.UPCOMING;
        } else if (now.isAfter(endDate)) {
            this.status = BannerStatus.ENDED;
        } else {
            this.status = BannerStatus.ACTIVE;
        }
    }

    // Helper method to check if banner is currently active
    public boolean isCurrentlyActive() {
        // Use Vietnam timezone (UTC+7) since database stores Vietnam local time
        LocalDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDateTime();
        return isActive && 
               !now.isBefore(startDate) && 
               !now.isAfter(endDate);
    }
}
