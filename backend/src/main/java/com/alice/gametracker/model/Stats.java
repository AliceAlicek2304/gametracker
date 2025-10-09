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

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}