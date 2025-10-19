package com.alice.gametracker.service;

import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;

import com.alice.gametracker.model.Account;
import com.alice.gametracker.model.Provider;
import com.alice.gametracker.model.Role;
import com.alice.gametracker.repository.AccountRepository;

@Service
public class OAuth2UserServiceImpl implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    @Autowired
    private FileStorageService fileStorageService;

    private static final Logger logger = LoggerFactory.getLogger(OAuth2UserServiceImpl.class);

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // As a minimal implementation, return an empty principal with the
        // registrationId
        String registration = userRequest.getClientRegistration().getRegistrationId();
    return new DefaultOAuth2User(Set.of(new SimpleGrantedAuthority("ROLE_USER")),
        Map.of("registration", registration), "registration");
    }

    public Account processProviderUser(String provider, Map<String, Object> userInfo) {
        if (provider == null) {
            throw new IllegalArgumentException("provider is required");
        }

        String providerId = Optional.ofNullable(userInfo.get("sub")).map(Object::toString).orElse(null);
        String email = Optional.ofNullable(userInfo.get("email")).map(Object::toString).orElse(null);
        String name = Optional.ofNullable(userInfo.get("name")).map(Object::toString).orElse(null);

        if (providerId == null) {
            throw new IllegalArgumentException("provider user id (sub) is required");
        }

        Provider provEnum;
        try {
            provEnum = Provider.valueOf(provider.toUpperCase());
        } catch (Exception ex) {
            provEnum = Provider.LOCAL;
        }

        // Try to find existing account by provider + providerId
        Account acc = accountRepository.findByProviderAndProviderId(provEnum, providerId).orElse(null);
        if (acc != null) {
            return acc;
        }

        if (email != null) {
            Optional<Account> byEmail = accountRepository.findByEmail(email);
            if (byEmail.isPresent()) {
                Account existing = byEmail.get();
                if (existing.getProvider() == null || existing.getProvider() == Provider.LOCAL) {
                    throw new RuntimeException("EMAIL_EXISTS_LOCAL");
                }
            }
        }

        // Create new account for this social user
        Account newAcc = new Account();
        newAcc.setFullName(name != null ? name : (email != null ? email : ""));
        String usernameBase = (email != null) ? email.split("@")[0] : (provider + "_" + providerId);
        String username = usernameBase;
        int suffix = 0;
        while (accountRepository.existsByUsername(username)) {
            suffix++;
            username = usernameBase + suffix;
        }
        newAcc.setUsername(username);
        // generate a random password and encode it; send raw to user via email
        String rawPassword = UUID.randomUUID().toString().replaceAll("-", "").substring(0, 12);
        newAcc.setPassword(passwordEncoder.encode(rawPassword));
        newAcc.setEmail(email);
        newAcc.setProvider(provEnum);
        newAcc.setProviderId(providerId);
        newAcc.setIsActive(true);
        newAcc.setRole(Role.CUSTOMER);
        // Set default avatar (local or s3)
        newAcc.setAvatar(fileStorageService.getDefaultAvatarUrl());
    // Set birth_day mặc định (Google không trả về)
    newAcc.setBirthDay(LocalDate.of(2004, 1, 1));

        Account saved = null;
        int saveAttempts = 0;
        // Try saving and recover from unique constraint races on username by retrying
        while (saved == null && saveAttempts < 6) {
            try {
                saved = accountRepository.save(newAcc);
            } catch (DataIntegrityViolationException ex) {
                saveAttempts++;
                logger.warn("Failed to save new social account due to constraint (attempt {}): {}", saveAttempts, ex.getMessage());
                // If it's a duplicate username, generate a new username with incremented suffix and retry
                suffix++;
                String newUsername = usernameBase + suffix;
                logger.info("Retrying with username: {}", newUsername);
                newAcc.setUsername(newUsername);
                // continue loop to retry
            }
        }
        if (saved == null) {
            throw new RuntimeException("Failed to create account after multiple attempts due to unique constraint");
        }

        // Email the user their generated credentials if we have an email
        if (email != null) {
            try {
                emailService.sendCredentialsEmail(email, saved.getFullName(), saved.getUsername(), rawPassword);
            } catch (Exception ex) {
                System.err.println("Failed to send credentials email: " + ex.getMessage());
            }
        }

        return saved;
    }
}
