package com.alice.gametracker.dto;

import java.util.Set;

public class FeaturedFiveStarIdsResponse {
    private Set<Long> characterIds;
    private Set<Long> weaponIds;

    public FeaturedFiveStarIdsResponse() {
    }

    public FeaturedFiveStarIdsResponse(Set<Long> characterIds, Set<Long> weaponIds) {
        this.characterIds = characterIds;
        this.weaponIds = weaponIds;
    }

    public Set<Long> getCharacterIds() {
        return characterIds;
    }

    public void setCharacterIds(Set<Long> characterIds) {
        this.characterIds = characterIds;
    }

    public Set<Long> getWeaponIds() {
        return weaponIds;
    }

    public void setWeaponIds(Set<Long> weaponIds) {
        this.weaponIds = weaponIds;
    }
}
