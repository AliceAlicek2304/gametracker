package com.alice.gametracker.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "skills")
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "skill_json", columnDefinition = "NVARCHAR(MAX)")
    private String skillJson;

    @Column(nullable = false)
    private boolean isActive = true;

    @Column(nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    public Skill() {}

    public Skill(JsonNode skillNode) {
        if (skillNode == null) {
            this.skillJson = null;
        } else {
            try {
                this.skillJson = MAPPER.writeValueAsString(skillNode);
            } catch (Exception ex) {
                this.skillJson = null;
            }
        }
    }

    // JSON helpers
    @Transient
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public JsonNode getSkillNode() {
        if (this.skillJson == null) return null;
        try { return MAPPER.readTree(this.skillJson); }
        catch (Exception ex) { return null; }
    }

    public void setSkillNode(JsonNode node) {
        if (node == null) { this.skillJson = null; return; }
        try { this.skillJson = MAPPER.writeValueAsString(node); }
        catch (Exception ex) { this.skillJson = null; }
    }

    // simple getters/setters
    public String getSkillJson() { return skillJson; }
    public void setSkillJson(String skillJson) { this.skillJson = skillJson; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}