package com.alice.gametracker.dto;

import java.util.List;

public class GachaResultResponse {
    private List<GachaItemResponse> items;
    private int pity4Star;
    private int pity5Star;
    private boolean guaranteed5StarFeatured;
    private boolean guaranteed4StarFeatured;

    public GachaResultResponse() {
    }

    public GachaResultResponse(List<GachaItemResponse> items, int pity4Star, int pity5Star, boolean guaranteed5StarFeatured, boolean guaranteed4StarFeatured) {
        this.items = items;
        this.pity4Star = pity4Star;
        this.pity5Star = pity5Star;
        this.guaranteed5StarFeatured = guaranteed5StarFeatured;
        this.guaranteed4StarFeatured = guaranteed4StarFeatured;
    }

    // Getters and Setters
    public List<GachaItemResponse> getItems() {
        return items;
    }

    public void setItems(List<GachaItemResponse> items) {
        this.items = items;
    }

    public int getPity4Star() {
        return pity4Star;
    }

    public void setPity4Star(int pity4Star) {
        this.pity4Star = pity4Star;
    }

    public int getPity5Star() {
        return pity5Star;
    }

    public void setPity5Star(int pity5Star) {
        this.pity5Star = pity5Star;
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
