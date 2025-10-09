package com.alice.gametracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.alice.gametracker.model.Character;

@Repository
public interface CharacterRepository extends JpaRepository<Character, Long> {
    
    @Query("SELECT COUNT(c) > 0 FROM Character c JOIN c.roles r WHERE r.id = :roleId")
    boolean existsByRoleId(@Param("roleId") Long roleId);
}