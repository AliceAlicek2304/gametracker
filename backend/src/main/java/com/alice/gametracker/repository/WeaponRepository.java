package com.alice.gametracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alice.gametracker.model.Weapon;

@Repository
public interface WeaponRepository extends JpaRepository<Weapon, Long> {
}