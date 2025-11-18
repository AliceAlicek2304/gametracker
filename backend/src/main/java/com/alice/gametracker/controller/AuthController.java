package com.alice.gametracker.controller;

import java.io.IOException;
import java.net.URI;
import java.net.URLDecoder;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.net.URLEncoder;
import java.net.http.HttpRequest;
import com.fasterxml.jackson.core.type.TypeReference;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alice.gametracker.dto.ApiResponse;
import com.alice.gametracker.dto.ForgotPasswordRequest;
import com.alice.gametracker.dto.LoginRequest;
import com.alice.gametracker.dto.LoginResponse;
import com.alice.gametracker.dto.ResetPasswordRequest;
import com.alice.gametracker.model.Account;
import com.alice.gametracker.service.AccountService;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.alice.gametracker.dto.OAuth2CodeRequest;
import com.alice.gametracker.service.OAuth2UserServiceImpl;
import com.alice.gametracker.utils.JwtUtils;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AccountService accountService;

    @Autowired
    private OAuth2UserServiceImpl oauth2UserService;

    @Autowired
    private JwtUtils jwtUtils;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    // User login endpoint
    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            logger.info("Login attempt for user: {}", loginRequest.getUsernameOrEmail());

            LoginResponse loginResponse = accountService.login(loginRequest);

            logger.info("User {} logged in successfully", loginRequest.getUsernameOrEmail());
            return ResponseEntity.ok(ApiResponse.success("Login successful", loginResponse));

        } catch (Exception e) {
            logger.warn("Login failed for user {}: {}", loginRequest.getUsernameOrEmail(), e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/oauth2/code")
    public ResponseEntity<LoginResponse> exchangeCode(@RequestBody OAuth2CodeRequest req) {
        if (!"google".equalsIgnoreCase(req.getProvider())) {
            throw new IllegalArgumentException("Only google provider supported");
        }

        HttpClient client = HttpClient.newHttpClient();
        URI tokenUri = URI.create("https://oauth2.googleapis.com/token");

        // If client sent an URL-encoded code (contains % or +), decode it first to
        // avoid double-encoding
        String incoming = req.getCode();
        String codeValue = incoming;
        if (codeValue != null && (codeValue.contains("%") || codeValue.contains("+"))) {
            try {
                codeValue = URLDecoder.decode(codeValue, StandardCharsets.UTF_8);
            } catch (IllegalArgumentException ex) {
                // fallback to original if decode fails for any reason
                codeValue = incoming;
            }
        }

        Map<String, String> form = new HashMap<>();
        form.put("code", codeValue);
        form.put("client_id", googleClientId);
        form.put("client_secret", googleClientSecret);
        form.put("redirect_uri", req.getRedirectUri());
        form.put("grant_type", "authorization_code");

        StringBuilder formBodyBuilder = new StringBuilder();
        for (Map.Entry<String, String> e : form.entrySet()) {
            if (formBodyBuilder.length() > 0) {
                formBodyBuilder.append('&');
            }
            formBodyBuilder.append(URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8));
            formBodyBuilder.append('=');
            formBodyBuilder.append(URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8));
        }

        HttpRequest tokenRequest = HttpRequest.newBuilder()
                .uri(tokenUri)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(formBodyBuilder.toString()))
                .build();

        try {
            HttpResponse<String> tokenResp = client.send(tokenRequest, HttpResponse.BodyHandlers.ofString());
            logger.info("Google token exchange response: status={}, body={}", tokenResp.statusCode(), tokenResp.body());
            if (tokenResp.statusCode() != 200) {
                throw new RuntimeException("Token exchange failed: " + tokenResp.body());
            }

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> tokenJson = mapper.readValue(tokenResp.body(),
                    new TypeReference<Map<String, Object>>() {
                    });
            String accessToken = (String) tokenJson.get("access_token");

            URI userInfoUri = URI.create("https://openidconnect.googleapis.com/v1/userinfo");
            HttpRequest userReq = HttpRequest.newBuilder()
                    .uri(userInfoUri)
                    .header("Authorization", "Bearer " + accessToken)
                    .GET()
                    .build();

            HttpResponse<String> userResp = client.send(userReq, HttpResponse.BodyHandlers.ofString());
            if (userResp.statusCode() != 200) {
                throw new RuntimeException("Failed fetching userinfo: " + userResp.body());
            }

            Map<String, Object> userJson = mapper.readValue(userResp.body(), new TypeReference<Map<String, Object>>() {
            });

            Account account = oauth2UserService.processProviderUser("google", userJson);

            String jwt = jwtUtils
                    .generateTokenFromUsername(account.getEmail() != null ? account.getEmail() : account.getUsername());

            LoginResponse resp = new LoginResponse(jwt, account.getId(), account.getUsername(), account.getFullName(),
                    account.getEmail(), account.getRole());
            return ResponseEntity.ok(resp);

        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("OAuth code exchange failed", e);
        }
    }

    // Email verification endpoint
    // GET /api/auth/verify-email?token=xxx
    @GetMapping("/verify-email")
    public void verifyEmail(@RequestParam("token") String token, HttpServletResponse response) {
        try {
            logger.info("Email verification attempt with token: {}", token.substring(0, 8) + "...");

            boolean verified = accountService.verifyEmail(token);

            if (verified) {
                logger.info("Email verification successful for token: {}", token.substring(0, 8) + "...");
                // Redirect to frontend verification page with success
                String redirectUrl = frontendUrl
                        + "/#verify-email?status=success&message=Email verified successfully! Your account is now active.";
                response.sendRedirect(redirectUrl);
            } else {
                logger.warn("Email verification failed for token: {}", token.substring(0, 8) + "...");
                // Redirect to frontend verification page with error
                String redirectUrl = frontendUrl
                        + "/#verify-email?status=error&message=Invalid or expired verification token!";
                response.sendRedirect(redirectUrl);
            }

        } catch (Exception e) {
            logger.error("Error during email verification: {}", e.getMessage());
            try {
                String redirectUrl = frontendUrl + "/#verify-email?status=error&message=Email verification failed!";
                response.sendRedirect(redirectUrl);
            } catch (IOException ioException) {
                logger.error("Error redirecting after verification failure: {}", ioException.getMessage());
            }
        }
    }

    // Forgot password endpoint
    // POST /api/auth/forgot-password
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            logger.info("Forgot password request for: {}", request.getUsernameOrEmail());

            boolean sent = accountService.requestPasswordReset(request);

            if (sent) {
                return ResponseEntity.ok(ApiResponse.success(
                        "Nếu tài khoản tồn tại, mã xác nhận đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư."));
            } else {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau."));
            }

        } catch (Exception e) {
            logger.error("Error during forgot password request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Có lỗi xảy ra. Vui lòng thử lại sau."));
        }
    }

    // Reset password endpoint
    // POST /api/auth/reset-password
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            logger.info("Password reset attempt for: {}", request.getUsernameOrEmail());

            boolean reset = accountService.resetPassword(request);

            if (reset) {
                return ResponseEntity.ok(ApiResponse.success(
                        "Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập bằng mật khẩu mới."));
            } else {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Có lỗi xảy ra khi đặt lại mật khẩu."));
            }

        } catch (Exception e) {
            logger.warn("Password reset failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // Test endpoint to check if auth service is working
    // GET /api/auth/test
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(ApiResponse.success("Auth service is working!"));
    }
}
