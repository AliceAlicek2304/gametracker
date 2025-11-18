package com.alice.gametracker.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.alice.gametracker.model.Banner;
import com.alice.gametracker.model.Event;
import com.alice.gametracker.repository.BannerRepository;
import com.alice.gametracker.repository.EventRepository;

@Component
public class StatusUpdateScheduler {
    
    private static final Logger log = LoggerFactory.getLogger(StatusUpdateScheduler.class);
    
    @Autowired
    private BannerRepository bannerRepository;
    
    @Autowired
    private EventRepository eventRepository;
    
    // Run every 30 seconds (for testing - change to "0 0 * * * *" for production)
    @Scheduled(cron = "*/30 * * * * *")
    @Transactional
    public void updateBannerStatuses() {
        log.info("Starting banner status update task");
        LocalDateTime now = LocalDateTime.now();
        
        List<Banner> banners = bannerRepository.findAll();
        int updated = 0;
        
        for (Banner banner : banners) {
            String oldStatus = banner.getStatus().toString();
            banner.updateStatus();
            String newStatus = banner.getStatus().toString();
            
            if (!oldStatus.equals(newStatus)) {
                bannerRepository.save(banner);
                updated++;
                log.info("Updated banner '{}' status from {} to {}", 
                    banner.getName(), oldStatus, newStatus);
            }
        }
        
        log.info("Banner status update completed. Updated {} banners", updated);
    }
    
    // Run every 30 seconds (for testing - change to "0 0 * * * *" for production)
    @Scheduled(cron = "*/30 * * * * *")
    @Transactional
    public void updateEventStatuses() {
        log.info("Starting event status update task");
        LocalDateTime now = LocalDateTime.now();
        
        List<Event> events = eventRepository.findAll();
        int updated = 0;
        
        for (Event event : events) {
            if (event.isActive() && event.getEndAt() != null && event.getEndAt().isBefore(now)) {
                event.setActive(false);
                eventRepository.save(event);
                updated++;
                log.info("Deactivated expired event '{}'", event.getTitle());
            }
        }
        
        log.info("Event status update completed. Deactivated {} events", updated);
    }
}
