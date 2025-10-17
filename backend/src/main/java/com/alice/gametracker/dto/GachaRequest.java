package com.alice.gametracker.dto;

public class GachaRequest {
    private Long bannerId;
    private int count; // 1 or 10
    private int pity5Star; // Current pity count for 5-star (from localStorage)
    private int pity4Star; // Current pity count for 4-star (from localStorage)
    private boolean guaranteed5StarFeatured; // Is next 5-star guaranteed featured?
    private boolean guaranteed4StarFeatured; // Is next 4-star guaranteed featured?

    public GachaRequest() {
    }

    public GachaRequest(Long bannerId, int count, int pity5Star, int pity4Star, boolean guaranteed5StarFeatured, boolean guaranteed4StarFeatured) {
        this.bannerId = bannerId;
        this.count = count;
        this.pity5Star = pity5Star;
        this.pity4Star = pity4Star;
        this.guaranteed5StarFeatured = guaranteed5StarFeatured;
        this.guaranteed4StarFeatured = guaranteed4StarFeatured;
    }

    // Getters and Setters
    public Long getBannerId() {
        return bannerId;
    }

    public void setBannerId(Long bannerId) {
        this.bannerId = bannerId;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public int getPity5Star() {
        return pity5Star;
    }

    public void setPity5Star(int pity5Star) {
        this.pity5Star = pity5Star;
    }

    public int getPity4Star() {
        return pity4Star;
    }

    public void setPity4Star(int pity4Star) {
        this.pity4Star = pity4Star;
    }

    public boolean isGuaranteed5StarFeatured() {
        return guaranteed5StarFeatured;
    }

    public void setGuaranteed5StarFeatured(boolean guaranteed5StarFeatured) {
        this.guaranteed5StarFeatured = guaranteed5StarFeatured;
    }

    public boolean isGuaranteed4StarFeatured() {
        return guaranteed4StarFeatured;
    }

    public void setGuaranteed4StarFeatured(boolean guaranteed4StarFeatured) {
        this.guaranteed4StarFeatured = guaranteed4StarFeatured;
    }
}
