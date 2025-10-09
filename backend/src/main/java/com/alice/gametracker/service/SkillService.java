package com.alice.gametracker.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alice.gametracker.model.Skill;
import com.alice.gametracker.repository.SkillRepository;

@Service
@Transactional
public class SkillService {

    @Autowired
    private SkillRepository skillRepository;

    public Skill save(Skill skill) {
        return skillRepository.save(skill);
    }

    public Optional<Skill> findById(Long id) {
        return skillRepository.findById(id);
    }

    public List<Skill> findAll() {
        return skillRepository.findAll();
    }

    public Skill update(Skill skill) {
        return skillRepository.save(skill);
    }

    public void deleteById(Long id) {
        skillRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return skillRepository.existsById(id);
    }
}