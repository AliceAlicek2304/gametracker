package com.alice.gametracker.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "echoes")
public class Echo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "NVARCHAR(500)")
    private String imageUrl;

    @Column(nullable = false, columnDefinition = "NVARCHAR(100)")
    private String name;

    @Column(columnDefinition = "NVARCHAR(1000)")
    private String description;

    @Column(nullable = false)
    private int cost = 0;

    @Column(columnDefinition = "NVARCHAR(1000)")
    private String skill;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "echo_set_echoes",
        joinColumns = @JoinColumn(name = "echo_id"),
        inverseJoinColumns = @JoinColumn(name = "set_echo_id")
    )
    private List<SetEcho> setEchoes = new ArrayList<>();

    @Column(nullable = false)
    private boolean isActive = true;

    @Column(nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    // Constructors
    public Echo() {}

    public Echo(String imageUrl, String name, String description, int cost, String skill) {
        this.imageUrl = imageUrl;
        this.name = name;
        this.description = description;
        this.cost = cost;
        this.skill = skill;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getCost() { return cost; }
    public void setCost(int cost) { this.cost = cost; }

    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }

    public List<SetEcho> getSetEchoes() { return setEchoes; }
    public void setSetEchoes(List<SetEcho> setEchoes) { this.setEchoes = setEchoes; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}