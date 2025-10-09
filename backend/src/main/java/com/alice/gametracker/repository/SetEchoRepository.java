package com.alice.gametracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alice.gametracker.model.SetEcho;

@Repository
public interface SetEchoRepository extends JpaRepository<SetEcho, Long> {
}