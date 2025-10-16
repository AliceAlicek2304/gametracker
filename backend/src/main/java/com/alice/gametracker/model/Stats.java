package com.alice.gametracker.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "stats")
public class Stats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private double atk;

    @Column(nullable = false)
    private double def;

    @Column(nullable = false)
    private double hp;

    @Column(nullable = false)
    private double atkUp;

    @Column(nullable = false)
    private double defUp;

    @Column(nullable = false)
    private double hpUp;

    // New fields - nullable to support existing records
    @Column(nullable = true)
    private Double critRate = 5.0; // Default 5%

    @Column(nullable = true)
    private Double critDamage = 150.0; // Default 150%

    @Column(nullable = true, length = 255)
    private String minorForte1; // Example: "CRIT Rate +8%"

    @Column(nullable = true, length = 255)
    private String minorForte2; // Example: "ATK +12%"

    @Column(nullable = false)
    private boolean isActive = true;

    @Column(nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    // Constructors
    public Stats() {}

    public Stats(double atk, double def, double hp, double atkUp, double defUp, double hpUp) {
        this.atk = atk;
        this.def = def;
        this.hp = hp;
        this.atkUp = atkUp;
        this.defUp = defUp;
        this.hpUp = hpUp;
        this.critRate = 5.0;
        this.critDamage = 150.0;
        this.minorForte1 = null;
        this.minorForte2 = null;
    }

    public Stats(double atk, double def, double hp, double atkUp, double defUp, double hpUp,
                 Double critRate, Double critDamage, String minorForte1, String minorForte2) {
        this.atk = atk;
        this.def = def;
        this.hp = hp;
        this.atkUp = atkUp;
        this.defUp = defUp;
        this.hpUp = hpUp;
        this.critRate = critRate != null ? critRate : 5.0;
        this.critDamage = critDamage != null ? critDamage : 150.0;
        this.minorForte1 = minorForte1;
        this.minorForte2 = minorForte2;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public double getAtk() { return atk; }
    public void setAtk(double atk) { this.atk = atk; }

    public double getDef() { return def; }
    public void setDef(double def) { this.def = def; }

    public double getHp() { return hp; }
    public void setHp(double hp) { this.hp = hp; }

    public double getAtkUp() { return atkUp; }
    public void setAtkUp(double atkUp) { this.atkUp = atkUp; }

    public double getDefUp() { return defUp; }
    public void setDefUp(double defUp) { this.defUp = defUp; }

    public double getHpUp() { return hpUp; }
    public void setHpUp(double hpUp) { this.hpUp = hpUp; }

    public Double getCritRate() { return critRate; }
    public void setCritRate(Double critRate) { this.critRate = critRate; }

    public Double getCritDamage() { return critDamage; }
    public void setCritDamage(Double critDamage) { this.critDamage = critDamage; }

    public String getMinorForte1() { return minorForte1; }
    public void setMinorForte1(String minorForte1) { this.minorForte1 = minorForte1; }

    public String getMinorForte2() { return minorForte2; }
    public void setMinorForte2(String minorForte2) { this.minorForte2 = minorForte2; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}