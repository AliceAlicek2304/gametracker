package com.alice.gametracker.dto;

import jakarta.validation.constraints.NotNull;

public class DeactivateRoleRequest {

    @NotNull(message = "Active status is required")
    private Boolean isActive;

    // Constructors
    public DeactivateRoleRequest() {}

    public DeactivateRoleRequest(Boolean isActive) {
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