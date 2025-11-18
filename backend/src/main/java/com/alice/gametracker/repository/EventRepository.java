package com.alice.gametracker.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alice.gametracker.model.Event;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByVersion(String version);

    List<Event> findByIsActive(boolean isActive);

    List<Event> findByVersionAndIsActive(String version, boolean isActive);

    Page<Event> findByVersion(String version, Pageable pageable);

    Page<Event> findByIsActive(boolean isActive, Pageable pageable);

    Page<Event> findByVersionAndIsActive(String version, boolean isActive, Pageable pageable);

    List<Event> findByStartDateBetween(LocalDateTime start, LocalDateTime end);

    Page<Event> findByStartDateBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
}
