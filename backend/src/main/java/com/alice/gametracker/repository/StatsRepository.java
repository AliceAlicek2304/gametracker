package com.alice.gametracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alice.gametracker.model.Stats;

@Repository
public interface StatsRepository extends JpaRepository<Stats, Long> {
}