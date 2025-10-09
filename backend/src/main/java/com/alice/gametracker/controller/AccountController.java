package com.alice.gametracker.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.alice.gametracker.dto.AccountResponse;
import com.alice.gametracker.dto.ApiResponse;
import com.alice.gametracker.dto.ChangeEmailRequest;
import com.alice.gametracker.dto.ChangePasswordRequest;
import com.alice.gametracker.dto.RegisterRequest;
import com.alice.gametracker.dto.ResendVerificationRequest;
import com.alice.gametracker.dto.UpdateProfileRequest;
import com.alice.gametracker.service.AccountService;
import com.alice.gametracker.service.FileStorageService;

import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/account")
public class AccountController {
    
    private static final Logger logger = LoggerFactory.getLogger(AccountController.class);
    
    @Autowired
    private AccountService accountService;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Value("${app.avatar.storage.location}")
    private String avatarStorageLocation;
    
    @Value("${app.avatar.url.pattern}")
    private String avatarUrlPattern;
    
    private Path avatarStoragePath;
    
    @PostConstruct
    public void init() {
        this.avatarStoragePath = Paths.get(avatarStorageLocation).toAbsolutePath().normalize();
        logger.info("Account controller initialized with avatar path: {}", avatarStoragePath);
    }
    
    // User registration endpoint
    // POST /api/account/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            logger.info("Registration attempt for username: {}", registerRequest.getUsername());
            
            AccountResponse accountResponse = accountService.register(registerRequest);
            
            logger.info("User {} registered successfully", registerRequest.getUsername());
            return ResponseEntity.ok(ApiResponse.success(
                "Registration successful! Please check your email for verification link.", 
                accountResponse));
            
        } catch (Exception e) {
            logger.warn("Registration failed for username {}: {}", registerRequest.getUsername(), e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Resend verification email endpoint
    // POST /api/account/resend-verification
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerificationEmail(@Valid @RequestBody ResendVerificationRequest request) {
        try {
            logger.info("Resend verification email request for: {}", request.getEmail());
            
            accountService.resendVerificationEmail(request.getEmail());
            
            logger.info("Verification email resent to: {}", request.getEmail());
            return ResponseEntity.ok(ApiResponse.success("Verification email sent successfully!"));
            
        } catch (Exception e) {
            logger.warn("Failed to resend verification email to {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get current user profile
    // GET /api/account/profile
    @GetMapping("/profile")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> getCurrentUserProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            logger.info("Getting profile for user: {}", username);
            
            AccountResponse accountResponse = accountService.getAccountByUsername(username);
            
            return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", accountResponse));
            
        } catch (Exception e) {
            logger.error("Error getting user profile: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Failed to get profile: " + e.getMessage()));
        }
    }
    
    // Update user profile
    // PUT /api/account/profile
    @PutMapping("/profile")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest updateRequest) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            logger.info("Profile update request for user: {}", username);
            
            AccountResponse updatedAccount = accountService.updateProfile(username, updateRequest);
            
            logger.info("Profile updated successfully for user: {}", username);
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updatedAccount));
            
        } catch (Exception e) {
            logger.warn("Profile update failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Get user by ID (Admin only)
    // GET /api/account/{id}
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            logger.info("Admin getting user profile for ID: {}", id);
            
            AccountResponse accountResponse = accountService.getAccountById(id);
            
            return ResponseEntity.ok(ApiResponse.success("User found", accountResponse));
            
        } catch (Exception e) {
            logger.warn("Failed to get user by ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Check username availability
    // GET /api/account/check-username?username=xxx
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsernameAvailability(@RequestParam String username) {
        try {
            boolean available = accountService.isUsernameAvailable(username);
            
            return ResponseEntity.ok(ApiResponse.success(
                available ? "Username is available" : "Username is already taken",
                available));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error checking username: " + e.getMessage()));
        }
    }
    
    // Check email availability
    // GET /api/account/check-email?email=xxx
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailAvailability(@RequestParam String email) {
        try {
            boolean available = accountService.isEmailAvailable(email);
            
            return ResponseEntity.ok(ApiResponse.success(
                available ? "Email is available" : "Email is already in use",
                available));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error checking email: " + e.getMessage()));
        }
    }
    
    // Serve avatar files
    // GET /api/account/avatar/{filename}
    @GetMapping("/avatar/{filename:.+}")
    public ResponseEntity<Resource> serveAvatarFile(@PathVariable String filename) {
        try {
            Path filePath = avatarStoragePath.resolve(filename).normalize();
            
            // Security check: ensure the file is within the storage directory
            if (!filePath.startsWith(avatarStoragePath)) {
                logger.warn("Attempted to access file outside storage directory: {}", filename);
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                // Determine content type
                String contentType = null;
                try {
                    contentType = Files.probeContentType(filePath);
                } catch (IOException ex) {
                    logger.debug("Could not determine file type for: {}", filename);
                }
                
                // Fallback to default content type if type could not be determined
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                logger.warn("File not found or not readable: {}", filename);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception ex) {
            logger.error("Error serving file: {}", filename, ex);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PutMapping("/change-password")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            logger.info("Password change request for user: {}", username);
            
            // Validate that new password and confirm password match
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "New password and confirm password do not match"));
            }
            
            accountService.changePassword(username, request.getCurrentPassword(), request.getNewPassword());
            
            logger.info("Password changed successfully for user: {}", username);
            return ResponseEntity.ok(new ApiResponse(true, "Password changed successfully"));
            
        } catch (Exception e) {
            logger.error("Error changing password", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    @PutMapping("/change-email")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse> changeEmail(@Valid @RequestBody ChangeEmailRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            logger.info("Email change request for user: {} to new email: {}", username, request.getNewEmail());
            
            accountService.changeEmail(username, request.getNewEmail(), request.getPassword());
            
            logger.info("Email changed successfully for user: {}", username);
            return ResponseEntity.ok(new ApiResponse(true, "Email changed successfully. Please verify your new email address."));
            
        } catch (Exception e) {
            logger.error("Error changing email", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, e.getMessage()));
        }
    }
    
    // Upload avatar
    // POST /api/account/upload-avatar
    @PostMapping("/upload-avatar")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse> uploadAvatar(@RequestParam("avatar") MultipartFile file) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            logger.info("Avatar upload request for user: {}", username);
            
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Please select a file to upload"));
            }
            
            // Check file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "File size must be less than 5MB"));
            }
            
            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Only image files are allowed"));
            }
            
            // Store avatar using FileStorageService  
            String avatarUrl = fileStorageService.storeAvatar(file);
            
            // Update user avatar in database
            accountService.updateAvatar(username, avatarUrl);
            
            logger.info("Avatar uploaded successfully for user: {} with URL: {}", username, avatarUrl);
            return ResponseEntity.ok(new ApiResponse(true, "Avatar uploaded successfully", avatarUrl));
            
        } catch (Exception e) {
            logger.error("Error uploading avatar", e);
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, "Failed to upload avatar: " + e.getMessage()));
        }
    }
}
