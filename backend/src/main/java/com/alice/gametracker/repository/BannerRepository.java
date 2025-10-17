package com.alice.gametracker.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.alice.gametracker.model.Banner;
import com.alice.gametracker.model.BannerStatus;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    
    // Find all active banners
    List<Banner> findByIsActiveTrueOrderByStartDateDesc();
    
    // Find banners by status
    List<Banner> findByStatusAndIsActiveTrueOrderByStartDateDesc(BannerStatus status);
    
    // Find currently running banners (between start and end date)
    @Query("SELECT b FROM Banner b WHERE b.isActive = true AND :now >= b.startDate AND :now <= b.endDate ORDER BY b.startDate DESC")
    List<Banner> findCurrentlyActiveBanners(LocalDateTime now);
    
    // Find upcoming banners
    @Query("SELECT b FROM Banner b WHERE b.isActive = true AND :now < b.startDate ORDER BY b.startDate ASC")
    List<Banner> findUpcomingBanners(LocalDateTime now);
    
    // Find past banners
    @Query("SELECT b FROM Banner b WHERE b.isActive = true AND :now > b.endDate ORDER BY b.endDate DESC")
    List<Banner> findPastBanners(LocalDateTime now);
    
    // Find banner by name
    Optional<Banner> findByName(String name);
}
