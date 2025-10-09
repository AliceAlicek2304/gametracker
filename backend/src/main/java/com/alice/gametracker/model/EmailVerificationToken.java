package com.alice.gametracker.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "email_verification_tokens")
public class EmailVerificationToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String token;
    
    @OneToOne(targetEntity = Account.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "account_id")
    private Account account;
    
    @Column(nullable = false)
    private LocalDateTime expiryDate;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime lastSentAt;
    
    // Constructors
    public EmailVerificationToken() {
        this.createdAt = LocalDateTime.now();
        this.lastSentAt = LocalDateTime.now();
    }
    
    public EmailVerificationToken(String token, Account account) {
        this.token = token;
        this.account = account;
        this.createdAt = LocalDateTime.now();
        this.lastSentAt = LocalDateTime.now();
        this.expiryDate = LocalDateTime.now().plusHours(24); // Token expires in 24 hours
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public Account getAccount() {
        return account;
    }
    
    public void setAccount(Account account) {
        this.account = account;
    }
    
    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }
    
    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getLastSentAt() {
        return lastSentAt;
    }
    
    public void setLastSentAt(LocalDateTime lastSentAt) {
        this.lastSentAt = lastSentAt;
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }
    
    public boolean canResend() {
        return LocalDateTime.now().isAfter(lastSentAt.plusSeconds(60));
    }
    
    public long getSecondsUntilCanResend() {
        LocalDateTime canResendAt = lastSentAt.plusSeconds(60);
        if (LocalDateTime.now().isAfter(canResendAt)) {
            return 0;
        }
        return java.time.Duration.between(LocalDateTime.now(), canResendAt).getSeconds();
    }
}
