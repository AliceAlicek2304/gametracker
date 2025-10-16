package com.alice.gametracker.dto;

import java.time.LocalDateTime;

public class StatsResponse {

    private Long id;
    private Double atk;
    private Double def;
    private Double hp;
    private Double atkUp;
    private Double defUp;
    private Double hpUp;
    private Double critRate;
    private Double critDamage;
    private String minorForte1;
    private String minorForte2;
    private Boolean isActive;
    private LocalDateTime createdDate;

    // Constructors
    public StatsResponse() {}

    public StatsResponse(Long id, Double atk, Double def, Double hp, Double atkUp,
                        Double defUp, Double hpUp, Double critRate, Double critDamage,
                        String minorForte1, String minorForte2, Boolean isActive, LocalDateTime createdDate) {
        this.id = id;
        this.atk = atk;
        this.def = def;
        this.hp = hp;
        this.atkUp = atkUp;
        this.defUp = defUp;
        this.hpUp = hpUp;
        this.critRate = critRate;
        this.critDamage = critDamage;
        this.minorForte1 = minorForte1;
        this.minorForte2 = minorForte2;
        this.isActive = isActive;
        this.createdDate = createdDate;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getAtk() {
        return atk;
    }

    public void setAtk(Double atk) {
        this.atk = atk;
    }

    public Double getDef() {
        return def;
    }

    public void setDef(Double def) {
        this.def = def;
    }

    public Double getHp() {
        return hp;
    }

    public void setHp(Double hp) {
        this.hp = hp;
    }

    public Double getAtkUp() {
        return atkUp;
    }

    public void setAtkUp(Double atkUp) {
        this.atkUp = atkUp;
    }

    public Double getDefUp() {
        return defUp;
    }

    public void setDefUp(Double defUp) {
        this.defUp = defUp;
    }

    public Double getHpUp() {
        return hpUp;
    }

    public void setHpUp(Double hpUp) {
        this.hpUp = hpUp;
    }

    public Double getCritRate() {
        return critRate;
    }

    public void setCritRate(Double critRate) {
        this.critRate = critRate;
    }

    public Double getCritDamage() {
        return critDamage;
    }

    public void setCritDamage(Double critDamage) {
        this.critDamage = critDamage;
    }

    public String getMinorForte1() {
        return minorForte1;
    }

    public void setMinorForte1(String minorForte1) {
        this.minorForte1 = minorForte1;
    }

    public String getMinorForte2() {
        return minorForte2;
    }

    public void setMinorForte2(String minorForte2) {
        this.minorForte2 = minorForte2;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }
}