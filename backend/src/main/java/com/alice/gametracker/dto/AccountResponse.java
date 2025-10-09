package com.alice.gametracker.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.alice.gametracker.model.Provider;
import com.alice.gametracker.model.Role;

public class AccountResponse {
    
    private Long id;
    private String fullName;
    private LocalDate birthDay;
    private String username;
    private String email;
    private String avatar;
    private Boolean isActive;
    private Role role;
    private Provider provider;
    private LocalDateTime createdAt;
    private Boolean emailVerified; // New field to indicate email verification status
    
    // Constructors
    public AccountResponse() {}
    
    public AccountResponse(Long id, String fullName, String username, String email, Role role) {
        this.id = id;
        this.fullName = fullName;
        this.username = username;
        this.email = email;
        this.role = role;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public LocalDate getBirthDay() {
        return birthDay;
    }
    
    public void setBirthDay(LocalDate birthDay) {
        this.birthDay = birthDay;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getAvatar() {
        return avatar;
    }
    
    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Role getRole() {
        return role;
    }
    
    public void setRole(Role role) {
        this.role = role;
    }
    
    public Provider getProvider() {
        return provider;
    }
    
    public void setProvider(Provider provider) {
        this.provider = provider;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public Boolean getEmailVerified() {
        return emailVerified;
    }
    
    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }
}
