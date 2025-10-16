package com.alice.gametracker.dto;

import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class UpdateCharacterRequest {

    @NotBlank(message = "Character name is required")
    private String name;

    @NotNull(message = "Rarity is required")
    private Integer rarity;

    @NotEmpty(message = "At least one role is required")
    private List<Long> roleIds;

    @NotNull(message = "Element is required")
    private String element;

    @NotNull(message = "Weapon type is required")
    private String weaponType;

    private String description;

    // Stats information (use Double to allow fractional stat-ups)
    @NotNull(message = "ATK is required")
    private Double atk;

    @NotNull(message = "DEF is required")
    private Double def;

    @NotNull(message = "HP is required")
    private Double hp;

    @NotNull(message = "ATK up is required")
    private Double atkUp;

    @NotNull(message = "DEF up is required")
    private Double defUp;

    @NotNull(message = "HP up is required")
    private Double hpUp;

    // New stats fields (optional with defaults)
    private Double critRate = 5.0; // Default 5%
    private Double critDamage = 150.0; // Default 150%
    private String minorForte1; // Example: "CRIT Rate +8%"
    private String minorForte2; // Example: "ATK +12%"

    // Structured skill payload (optional).
    private JsonNode skill;

    // Constructors
    public UpdateCharacterRequest() {}

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getRarity() {
        return rarity;
    }

    public void setRarity(Integer rarity) {
        this.rarity = rarity;
    }

    public List<Long> getRoleIds() {
        return roleIds;
    }

    public void setRoleIds(List<Long> roleIds) {
        this.roleIds = roleIds;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public JsonNode getSkill() { return skill; }
    public void setSkill(JsonNode skill) { this.skill = skill; }
}