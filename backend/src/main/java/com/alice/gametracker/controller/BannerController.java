package com.alice.gametracker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alice.gametracker.dto.BannerResponse;
import com.alice.gametracker.dto.CreateBannerRequest;
import com.alice.gametracker.dto.GachaRequest;
import com.alice.gametracker.dto.GachaResultResponse;
import com.alice.gametracker.service.BannerService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/banners")
@CrossOrigin(origins = "http://localhost:5173")
public class BannerController {

    @Autowired
    private BannerService bannerService;

    // Get all active banners
    @GetMapping
    public ResponseEntity<List<BannerResponse>> getAllActiveBanners() {
        List<BannerResponse> banners = bannerService.getAllActiveBanners();
        return ResponseEntity.ok(banners);
    }

    // Get currently running banners (active right now)
    @GetMapping("/current")
    public ResponseEntity<List<BannerResponse>> getCurrentBanners() {
        List<BannerResponse> banners = bannerService.getCurrentBanners();
        return ResponseEntity.ok(banners);
    }

    // Get upcoming banners
    @GetMapping("/upcoming")
    public ResponseEntity<List<BannerResponse>> getUpcomingBanners() {
        List<BannerResponse> banners = bannerService.getUpcomingBanners();
        return ResponseEntity.ok(banners);
    }

    // Get past banners (history)
    @GetMapping("/history")
    public ResponseEntity<List<BannerResponse>> getPastBanners() {
        List<BannerResponse> banners = bannerService.getPastBanners();
        return ResponseEntity.ok(banners);
    }

    // Get banner by ID
    @GetMapping("/{id}")
    public ResponseEntity<BannerResponse> getBannerById(@PathVariable Long id) {
        try {
            BannerResponse banner = bannerService.getBannerById(id);
            return ResponseEntity.ok(banner);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Create new banner
    @PostMapping
    public ResponseEntity<?> createBanner(@Valid @RequestBody CreateBannerRequest request) {
        try {
            BannerResponse banner = bannerService.createBanner(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(banner);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Update banner
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBanner(@PathVariable Long id, @Valid @RequestBody CreateBannerRequest request) {
        try {
            BannerResponse banner = bannerService.updateBanner(id, request);
            return ResponseEntity.ok(banner);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Delete banner (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBanner(@PathVariable Long id) {
        try {
            bannerService.deleteBanner(id);
            return ResponseEntity.ok("Banner deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Update all banner statuses
    @PostMapping("/update-statuses")
    public ResponseEntity<String> updateAllBannerStatuses() {
        bannerService.updateAllBannerStatuses();
        return ResponseEntity.ok("All banner statuses updated");
    }

    // Get featured 5-star IDs from active banners
    @GetMapping("/featured-ids")
    public ResponseEntity<?> getFeaturedFiveStarIds() {
        try {
            return ResponseEntity.ok(bannerService.getFeaturedFiveStarIds());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Perform gacha roll
    @PostMapping("/gacha")
    public ResponseEntity<?> performGacha(@RequestBody GachaRequest request) {
        try {
            GachaResultResponse result = bannerService.performGacha(request.getBannerId(), request.getCount(), request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
