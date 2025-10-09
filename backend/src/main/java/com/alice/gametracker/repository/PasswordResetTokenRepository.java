package com.alice.gametracker.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.alice.gametracker.model.Account;
import com.alice.gametracker.model.PasswordResetToken;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    // Tìm token theo code
    Optional<PasswordResetToken> findByCode(String code);
    
    // Tìm token theo account và chưa sử dụng
    Optional<PasswordResetToken> findByAccountAndUsedFalse(Account account);
    
    // Xóa tất cả token hết hạn
    @Modifying
    @Transactional
    @Query("DELETE FROM PasswordResetToken p WHERE p.expiryDate < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);
    
    // Xóa tất cả token của một account
    @Modifying
    @Transactional
    void deleteByAccount(Account account);
    
    // Tìm token theo account, code và chưa sử dụng
    Optional<PasswordResetToken> findByAccountAndCodeAndUsedFalse(Account account, String code);
}
