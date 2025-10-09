package com.alice.gametracker.dto;

public class DeactivateWeaponRequest {
    private Boolean isActive;

    public DeactivateWeaponRequest() {}

    public DeactivateWeaponRequest(Boolean isActive) { this.isActive = isActive; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
