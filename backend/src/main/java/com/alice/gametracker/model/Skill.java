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

    @Column(name = "skill_json", columnDefinition = "LONGTEXT")
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
        if (this.skillJson == null) {
            return null;
        }
        try { 
            // Fix: MySQL import converted escape sequences to literal characters
            // Need to properly escape all special characters before JSON parsing
            String fixedJson = this.skillJson
                .replace("\\", "\\\\")   // Backslash must be first!
                .replace("\"", "\\\"")   // Quote
                .replace("\b", "\\b")    // Backspace
                .replace("\f", "\\f")    // Form feed
                .replace("\n", "\\n")    // Newline
                .replace("\r", "\\r")    // Carriage return
                .replace("\t", "\\t");   // Tab
            
            return MAPPER.readTree(fixedJson); 
        }
        catch (Exception ex) { 
            System.err.println("Failed to parse skill JSON for id " + this.id + ": " + ex.getMessage());
            return null; 
        }
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