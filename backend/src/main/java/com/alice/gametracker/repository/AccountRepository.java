package com.alice.gametracker.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.alice.gametracker.model.Account;
import com.alice.gametracker.model.Provider;
import com.alice.gametracker.model.Role;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    
    // Find by username
    Optional<Account> findByUsername(String username);
    
    // Find by email
    Optional<Account> findByEmail(String email);
    
    // Find by username or email
    @Query("SELECT a FROM Account a WHERE a.username = :usernameOrEmail OR a.email = :usernameOrEmail OR a.email = CONCAT(:usernameOrEmail, '_V')")
    Optional<Account> findByUsernameOrEmail(@Param("usernameOrEmail") String usernameOrEmail);
    
    // Find by provider and provider ID (for OAuth login)
    Optional<Account> findByProviderAndProviderId(Provider provider, String providerId);
    
    // Check if username exists
    boolean existsByUsername(String username);
    
    // Check if email exists
    boolean existsByEmail(String email);
    
    // Find active accounts
    List<Account> findByIsActiveTrue();
    
    // Find by role
    List<Account> findByRole(Role role);
    
    // Find by role and active status
    List<Account> findByRoleAndIsActive(Role role, Boolean isActive);
    
    // Find by provider
    List<Account> findByProvider(Provider provider);
    
    // Search accounts by full name containing keyword (case insensitive)
    @Query("SELECT a FROM Account a WHERE LOWER(a.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Account> searchByFullNameContaining(@Param("keyword") String keyword);
    
    // Count accounts by role
    long countByRole(Role role);
    
    // Count active accounts
    long countByIsActiveTrue();
}
