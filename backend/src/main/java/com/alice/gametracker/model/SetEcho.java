package com.alice.gametracker.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "set_echoes")
public class SetEcho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "NVARCHAR(1000)")
    private String skill;

    @Column(columnDefinition = "NVARCHAR(500)")
    private String icon;

    @ManyToMany
    @JoinTable(
        name = "set_echo_echoes",
        joinColumns = @JoinColumn(name = "set_echo_id"),
        inverseJoinColumns = @JoinColumn(name = "echo_id")
    )
    private List<Echo> echoes = new ArrayList<>();

    @Column(nullable = false)
    private boolean isActive = true;

    @Column(nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    // Constructors
    public SetEcho() {}

    public SetEcho(String name, String skill, String icon) {
        this.name = name;
        this.skill = skill;
        this.icon = icon;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public List<Echo> getEchoes() { return echoes; }
    public void setEchoes(List<Echo> echoes) { this.echoes = echoes; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
}