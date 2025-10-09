package com.alice.gametracker.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.alice.gametracker.model.Account;
import com.alice.gametracker.model.EmailVerificationToken;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    
    Optional<EmailVerificationToken> findByToken(String token);
    
    Optional<EmailVerificationToken> findByAccount(Account account);
    
    void deleteByAccount(Account account);
    
    @Modifying
    @Query("DELETE FROM EmailVerificationToken evt WHERE evt.expiryDate <= :now")
    void deleteAllExpiredTokens(@Param("now") LocalDateTime now);
    
    @Modifying
    @Query("DELETE FROM EmailVerificationToken evt WHERE evt.createdAt < :cutoffDate")
    long deleteByCreatedAtBefore(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    @Query("SELECT COUNT(evt) FROM EmailVerificationToken evt WHERE evt.expiryDate <= :now")
    long countExpiredTokens(@Param("now") LocalDateTime now);
    
    @Query("SELECT COUNT(evt) FROM EmailVerificationToken evt WHERE evt.expiryDate > :now")
    long countActiveTokens(@Param("now") LocalDateTime now);
    
    boolean existsByAccount(Account account);
}
