package com.alice.gametracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alice.gametracker.model.RoleCharacter;

@Repository
public interface RoleCharacterRepository extends JpaRepository<RoleCharacter, Long> {
}