package com.alice.gametracker.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alice.gametracker.dto.AccountResponse;
import com.alice.gametracker.dto.ForgotPasswordRequest;
import com.alice.gametracker.dto.LoginRequest;
import com.alice.gametracker.dto.LoginResponse;
import com.alice.gametracker.dto.RegisterRequest;
import com.alice.gametracker.dto.ResetPasswordRequest;
import com.alice.gametracker.dto.UpdateProfileRequest;
import com.alice.gametracker.model.Account;
import com.alice.gametracker.model.EmailVerificationToken;
import com.alice.gametracker.model.PasswordResetToken;
import com.alice.gametracker.model.Provider;
import com.alice.gametracker.model.Role;
import com.alice.gametracker.repository.AccountRepository;
import com.alice.gametracker.repository.EmailVerificationTokenRepository;
import com.alice.gametracker.repository.PasswordResetTokenRepository;
import com.alice.gametracker.utils.JwtUtils;

@Service
@Transactional
public class AccountService {
    
    private static final Logger logger = LoggerFactory.getLogger(AccountService.class);
    
    @Autowired
    private AccountRepository accountRepository;
    
    @Autowired
    private EmailVerificationTokenRepository tokenRepository;
    
    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    public AccountResponse register(RegisterRequest request) {
        logger.info("Attempting to register new account with username: {}", request.getUsername());
        
        // Check if username already exists
        if (!isUsernameAvailable(request.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }
        
        // Check if email already exists (both original and verified forms)
        if (!isEmailAvailable(request.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }
        
        // Create new account
        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setFullName(request.getFullName());
        account.setEmail(request.getEmail());
        account.setBirthDay(request.getBirthday());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setRole(Role.CUSTOMER);
        account.setProvider(Provider.LOCAL);
        account.setIsActive(true); // Account active immediately, email verification optional
        
        // Set default avatar
        account.setAvatar(fileStorageService.getDefaultAvatarUrl());
        
        // Save account
        Account savedAccount = accountRepository.save(account);
        logger.info("Account created successfully with ID: {} and default avatar: {}", 
                   savedAccount.getId(), savedAccount.getAvatar());
        
        // Generate and save email verification token
        String verificationToken = UUID.randomUUID().toString();
        EmailVerificationToken emailToken = new EmailVerificationToken(verificationToken, savedAccount);
        tokenRepository.save(emailToken);
        
        // Send verification email asynchronously
        // Wrap in try-catch to prevent transaction rollback if email sending fails
        try {
            emailService.sendVerificationEmail(savedAccount.getEmail(), verificationToken);
            logger.info("Verification email queued for: {}", savedAccount.getEmail());
        } catch (Exception e) {
            // Log error but don't fail the registration
            logger.error("Failed to queue verification email for: {}. Error: {}", savedAccount.getEmail(), e.getMessage());
            logger.warn("Account created successfully but email sending failed. User can resend verification email later.");
        }
        
        return convertToAccountResponse(savedAccount);
    }
    
    public LoginResponse login(LoginRequest request) {
        logger.info("Attempting login for user: {}", request.getUsernameOrEmail());
        
        // Find account
        Optional<Account> accountOpt = accountRepository.findByUsernameOrEmail(request.getUsernameOrEmail());
        if (accountOpt.isEmpty()) {
            throw new RuntimeException("Invalid username/email or password!");
        }
        
        Account account = accountOpt.get();
        
        // Check if account is active (not banned/disabled)
        if (!account.getIsActive()) {
            throw new RuntimeException("Account is disabled. Please contact administrator!");
        }
        
        // Authenticate user (email verification is optional for login)
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Generate JWT token
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        logger.info("User {} logged in successfully", account.getUsername());
        
        return new LoginResponse(jwt, account.getId(), account.getUsername(), 
                               account.getFullName(), account.getEmail(), account.getRole());
    }
    
    public boolean verifyEmail(String token) {
        logger.info("Attempting to verify email with token: {}", token);
        
        Optional<EmailVerificationToken> tokenOpt = tokenRepository.findByToken(token);
        if (tokenOpt.isEmpty()) {
            logger.warn("Invalid verification token: {}", token);
            return false;
        }
        
        EmailVerificationToken emailToken = tokenOpt.get();
        
        // Check if token is expired
        if (emailToken.isExpired()) {
            logger.warn("Verification token expired: {}", token);
            tokenRepository.delete(emailToken);
            return false;
        }
        
        // Activate account and mark email as verified
        Account account = emailToken.getAccount();
        account.setIsActive(true);
        
        // Add _V suffix to email to mark as verified
        String originalEmail = account.getEmail();
        if (!originalEmail.endsWith("_V")) {
            account.setEmail(originalEmail + "_V");
            logger.info("Email marked as verified with _V suffix: {}", account.getEmail());
        }
        
        accountRepository.save(account);
        
        // Delete the token after successful verification
        tokenRepository.delete(emailToken);
        
        // Send welcome email to original email (without _V)
        try {
            emailService.sendWelcomeEmail(getOriginalEmail(account.getEmail()), account.getFullName());
        } catch (Exception e) {
            logger.error("Failed to send welcome email", e);
        }
        
        logger.info("Email verified successfully for user: {}", account.getUsername());
        return true;
    }
    
    public void resendVerificationEmail(String email) {
        logger.info("Resending verification email to: {}", email);
        
        // Find account by original email (with or without _V)
        Optional<Account> accountOpt = findByOriginalEmail(email);
        if (accountOpt.isEmpty()) {
            throw new RuntimeException("Email not found!");
        }
        
        Account account = accountOpt.get();
        
        // Check if account is active
        if (!account.getIsActive()) {
            throw new RuntimeException("Account is disabled. Please contact administrator!");
        }
        
        // Check if email is already verified
        if (isEmailVerified(account.getEmail())) {
            throw new RuntimeException("Email is already verified!");
        }
        
        // Check if there's an existing token and rate limit
        Optional<EmailVerificationToken> existingTokenOpt = tokenRepository.findByAccount(account);
        if (existingTokenOpt.isPresent()) {
            EmailVerificationToken existingToken = existingTokenOpt.get();
            
            if (!existingToken.canResend()) {
                long secondsLeft = existingToken.getSecondsUntilCanResend();
                throw new RuntimeException("Please wait " + secondsLeft + " seconds before requesting another verification email!");
            }
            
            // Update last sent time and regenerate token
            existingToken.setToken(UUID.randomUUID().toString());
            existingToken.setLastSentAt(LocalDateTime.now());
            existingToken.setExpiryDate(LocalDateTime.now().plusHours(24));
            tokenRepository.save(existingToken);
            
            // Send verification email to original email (without _V) - async
            String originalEmail = getOriginalEmail(account.getEmail());
            emailService.sendVerificationEmail(originalEmail, existingToken.getToken());
        } else {
            // Create new token if none exists
            String verificationToken = UUID.randomUUID().toString();
            EmailVerificationToken emailToken = new EmailVerificationToken(verificationToken, account);
            tokenRepository.save(emailToken);
            
            // Send verification email to original email (without _V) - async
            String originalEmail = getOriginalEmail(account.getEmail());
            emailService.sendVerificationEmail(originalEmail, verificationToken);
        }
        
        logger.info("Verification email queued for: {}", getOriginalEmail(account.getEmail()));
    }
    
    public AccountResponse getAccountById(Long id) {
        Account account = accountRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Account not found!"));
        return convertToAccountResponse(account);
    }
    
    public AccountResponse getAccountByUsername(String username) {
        Account account = accountRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Account not found!"));
        return convertToAccountResponse(account);
    }
    
    public AccountResponse updateProfile(String username, UpdateProfileRequest request) {
        logger.info("Updating profile for user: {}", username);
        
        Account account = accountRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Account not found!"));
        
        // Update fields if provided
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            account.setFullName(request.getFullName().trim());
        }
        
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String newEmail = request.getEmail().trim();
            // Check if new email is already in use by another account
            if (!isEmailAvailableForUser(newEmail, account.getId())) {
                throw new RuntimeException("Email is already in use by another account!");
            }
            account.setEmail(newEmail);
        }
        
        if (request.getBirthday() != null) {
            account.setBirthDay(request.getBirthday());
        }
        
        if (request.getAvatar() != null) {
            account.setAvatar(request.getAvatar());
        }
        
        Account updatedAccount = accountRepository.save(account);
        logger.info("Profile updated successfully for user: {}", username);
        
        return convertToAccountResponse(updatedAccount);
    }
    
    public boolean isUsernameAvailable(String username) {
        return !accountRepository.existsByUsername(username);
    }
    
    public boolean isEmailAvailable(String email) {
        // Check if email exists in original form
        if (accountRepository.existsByEmail(email)) {
            return false;
        }
        
        // Check if email exists in verified form (with _V suffix)
        return !accountRepository.existsByEmail(email + "_V");
    }
    
    // Check if email is available for a specific user (for profile updates)
    public boolean isEmailAvailableForUser(String email, Long userId) {
        // Check original form
        Optional<Account> existingAccount = accountRepository.findByEmail(email);
        if (existingAccount.isPresent() && !existingAccount.get().getId().equals(userId)) {
            return false;
        }
        
        // Check verified form (with _V suffix)
        Optional<Account> verifiedAccount = accountRepository.findByEmail(email + "_V");
        if (verifiedAccount.isPresent() && !verifiedAccount.get().getId().equals(userId)) {
            return false;
        }
        
        return true;
    }
    
    // Get original email by removing _V suffix if present
    private String getOriginalEmail(String email) {
        if (email != null && email.endsWith("_V")) {
            return email.substring(0, email.length() - 2);
        }
        return email;
    }
    
    // Check if email is verified (has _V suffix)
    public boolean isEmailVerified(String email) {
        return email != null && email.endsWith("_V");
    }
    
    // Find account by original email (with or without _V suffix)
    public Optional<Account> findByOriginalEmail(String email) {
        // Try with original email first
        Optional<Account> account = accountRepository.findByEmail(email);
        if (account.isPresent()) {
            return account;
        }
        
        // Try with _V suffix if not found
        if (!email.endsWith("_V")) {
            return accountRepository.findByEmail(email + "_V");
        }
        
        return Optional.empty();
    }
    
    // Forgot Password methods
    public boolean requestPasswordReset(ForgotPasswordRequest request) {
        logger.info("Password reset requested for: {}", request.getUsernameOrEmail());
        
        // Find account by username or email
        Optional<Account> accountOpt = accountRepository.findByUsernameOrEmail(request.getUsernameOrEmail());
        if (accountOpt.isEmpty()) {
            logger.warn("Account not found for password reset: {}", request.getUsernameOrEmail());
            // Return true anyway to prevent user enumeration
            return true;
        }
        
        Account account = accountOpt.get();
        
        // Check if account is active
        if (!account.getIsActive()) {
            logger.warn("Password reset requested for inactive account: {}", account.getUsername());
            return false;
        }
        
        try {
            // Delete existing reset tokens for this account
            passwordResetTokenRepository.deleteByAccount(account);
            
            // Generate 6-digit code
            String resetCode = generateResetCode();
            
            // Create new reset token
            PasswordResetToken resetToken = new PasswordResetToken(resetCode, account);
            passwordResetTokenRepository.save(resetToken);
            
            // Send reset email
            String email = getOriginalEmail(account.getEmail());
            emailService.sendPasswordResetEmail(email, account.getFullName(), resetCode);
            
            logger.info("Password reset code sent to: {}", email);
            return true;
            
        } catch (Exception e) {
            logger.error("Error sending password reset email: {}", e.getMessage(), e);
            return false;
        }
    }
    
    public boolean resetPassword(ResetPasswordRequest request) {
        logger.info("Password reset attempt for: {}", request.getUsernameOrEmail());
        
        // Validate passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            logger.warn("Password confirmation mismatch for: {}", request.getUsernameOrEmail());
            throw new RuntimeException("Mật khẩu xác nhận không khớp!");
        }
        
        // Find account
        Optional<Account> accountOpt = accountRepository.findByUsernameOrEmail(request.getUsernameOrEmail());
        if (accountOpt.isEmpty()) {
            logger.warn("Account not found for password reset: {}", request.getUsernameOrEmail());
            throw new RuntimeException("Không tìm thấy tài khoản!");
        }
        
        Account account = accountOpt.get();
        
        // Find reset token
        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository
            .findByAccountAndCodeAndUsedFalse(account, request.getResetCode());
        
        if (tokenOpt.isEmpty()) {
            logger.warn("Invalid reset code for account: {}", account.getUsername());
            throw new RuntimeException("Mã xác nhận không hợp lệ!");
        }
        
        PasswordResetToken resetToken = tokenOpt.get();
        
        // Check if token is expired
        if (resetToken.isExpired()) {
            logger.warn("Expired reset code for account: {}", account.getUsername());
            passwordResetTokenRepository.delete(resetToken);
            throw new RuntimeException("Mã xác nhận đã hết hạn!");
        }
        
        try {
            // Update password
            account.setPassword(passwordEncoder.encode(request.getNewPassword()));
            accountRepository.save(account);
            
            // Mark token as used
            resetToken.setUsed(true);
            passwordResetTokenRepository.save(resetToken);
            
            logger.info("Password successfully reset for account: {}", account.getUsername());
            return true;
            
        } catch (Exception e) {
            logger.error("Error resetting password: {}", e.getMessage(), e);
            throw new RuntimeException("Có lỗi xảy ra khi đặt lại mật khẩu!");
        }
    }
    
    private String generateResetCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 6-digit code
        return String.valueOf(code);
    }
    
    private AccountResponse convertToAccountResponse(Account account) {
        AccountResponse response = new AccountResponse();
        response.setId(account.getId());
        response.setUsername(account.getUsername());
        response.setFullName(account.getFullName());
        // Return original email (without _V suffix) to client
        response.setEmail(getOriginalEmail(account.getEmail()));
        response.setBirthDay(account.getBirthDay());
        response.setAvatar(account.getAvatar());
        response.setIsActive(account.getIsActive());
        response.setRole(account.getRole());
        response.setProvider(account.getProvider());
        response.setCreatedAt(account.getCreatedAt());
        // Set email verification status based on _V suffix
        response.setEmailVerified(isEmailVerified(account.getEmail()));
        return response;
    }
    
    public void changePassword(String username, String currentPassword, String newPassword) {
        try {
            // Find account by username
            Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
            
            // Verify current password
            if (!passwordEncoder.matches(currentPassword, account.getPassword())) {
                throw new RuntimeException("Mật khẩu hiện tại không chính xác");
            }
            
            // Check if new password is different from current password
            if (passwordEncoder.matches(newPassword, account.getPassword())) {
                throw new RuntimeException("Mật khẩu mới phải khác với mật khẩu hiện tại");
            }
            
            // Update password
            account.setPassword(passwordEncoder.encode(newPassword));
            accountRepository.save(account);
            
            logger.info("Password changed successfully for user: {}", username);
            
        } catch (Exception e) {
            logger.error("Error changing password for user: {}", username, e);
            throw e;
        }
    }
    
    public void changeEmail(String username, String newEmail, String password) {
        try {
            // Find account by username
            Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
            
            // Verify password
            if (!passwordEncoder.matches(password, account.getPassword())) {
                throw new RuntimeException("Mật khẩu không chính xác");
            }
            
            // Check if new email is different from current email
            String currentOriginalEmail = getOriginalEmail(account.getEmail());
            if (currentOriginalEmail.equalsIgnoreCase(newEmail)) {
                throw new RuntimeException("Email mới phải khác với email hiện tại");
            }
            
            // Check if new email already exists
            if (accountRepository.findByEmail(newEmail).isPresent() || 
                accountRepository.findByEmail(newEmail + "_V").isPresent()) {
                throw new RuntimeException("Email này đã được sử dụng bởi tài khoản khác");
            }
            
            // Update email (set as unverified)
            account.setEmail(newEmail);
            accountRepository.save(account);
            
            // Send verification email for new email
            // Create new verification token
            String verificationToken = UUID.randomUUID().toString();
            EmailVerificationToken emailToken = new EmailVerificationToken();
            emailToken.setToken(verificationToken);
            emailToken.setAccount(account);
            emailToken.setExpiryDate(LocalDateTime.now().plusHours(24));
            tokenRepository.save(emailToken);
            
            // Send verification email
            emailService.sendVerificationEmail(newEmail, verificationToken);
            
            logger.info("Email changed successfully for user: {} to new email: {}", username, newEmail);
            
        } catch (Exception e) {
            logger.error("Error changing email for user: {}", username, e);
            throw e;
        }
    }
    
    // Update user avatar
    public void updateAvatar(String username, String avatarUrl) {
        try {
            Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Delete old avatar file if exists (except default avatar)
            String oldAvatar = account.getAvatar();
            if (oldAvatar != null && !oldAvatar.contains("default-avatar.jpg")) {
                // TODO: Delete old avatar file from filesystem
                logger.info("Old avatar URL: {}", oldAvatar);
            }
            
            account.setAvatar(avatarUrl);
            accountRepository.save(account);
            
            logger.info("Avatar updated successfully for user: {} to: {}", username, avatarUrl);
            
        } catch (Exception e) {
            logger.error("Error updating avatar for user: {}", username, e);
            throw new RuntimeException("Failed to update avatar: " + e.getMessage());
        }
    }
}
