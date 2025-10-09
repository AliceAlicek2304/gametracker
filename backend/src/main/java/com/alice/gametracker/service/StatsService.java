package com.alice.gametracker.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alice.gametracker.model.Stats;
import com.alice.gametracker.repository.StatsRepository;

@Service
@Transactional
public class StatsService {

    @Autowired
    private StatsRepository statsRepository;

    public Stats save(Stats stats) {
        return statsRepository.save(stats);
    }

    public Optional<Stats> findById(Long id) {
        return statsRepository.findById(id);
    }

    public List<Stats> findAll() {
        return statsRepository.findAll();
    }

    public Stats update(Stats stats) {
        return statsRepository.save(stats);
    }

    public void deleteById(Long id) {
        statsRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return statsRepository.existsById(id);
    }
}