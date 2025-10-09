package com.alice.gametracker.dto;

import jakarta.validation.constraints.NotNull;

public class DeactivateCharacterRequest {

    @NotNull(message = "Active status is required")
    private Boolean isActive;

    // Constructors
    public DeactivateCharacterRequest() {}

    public DeactivateCharacterRequest(Boolean isActive) {
        this.isActive = isActive;
    }

    // Getters and Setters
    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}