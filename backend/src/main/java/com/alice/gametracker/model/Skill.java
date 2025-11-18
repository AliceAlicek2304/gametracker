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
            // JSON string from DB is already properly formatted with escape sequences
            // Jackson handles it directly without any preprocessing needed
            return MAPPER.readTree(this.skillJson); 
        }
        catch (Exception ex) { 
            System.err.println("\n========== SKILL JSON DEBUG (ID: " + this.id + ") ==========");
            System.err.println("Error: " + ex.getMessage());
            if (this.skillJson != null) {
                System.err.println("JSON Length: " + this.skillJson.length());
                System.err.println("\n--- First 500 chars (escaped view) ---");
                String sample = this.skillJson.substring(0, Math.min(500, this.skillJson.length()));
                System.err.println(sample.replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t"));
                
                System.err.println("\n--- Last 200 chars (escaped view) ---");
                int start = Math.max(0, this.skillJson.length() - 200);
                String tail = this.skillJson.substring(start);
                System.err.println(tail.replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t"));
                
                System.err.println("\n--- Char analysis at position 0-50 ---");
                for (int i = 0; i < Math.min(50, this.skillJson.length()); i++) {
                    char c = this.skillJson.charAt(i);
                    System.err.print(String.format("%c(%d) ", c, (int)c));
                    if ((i + 1) % 10 == 0) System.err.println();
                }
            }
            System.err.println("\n========================================\n");
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