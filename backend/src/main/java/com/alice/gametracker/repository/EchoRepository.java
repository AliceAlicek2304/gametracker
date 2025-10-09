package com.alice.gametracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alice.gametracker.model.Echo;

@Repository
public interface EchoRepository extends JpaRepository<Echo, Long> {
}