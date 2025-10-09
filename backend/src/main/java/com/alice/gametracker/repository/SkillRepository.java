package com.alice.gametracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alice.gametracker.model.Skill;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
}