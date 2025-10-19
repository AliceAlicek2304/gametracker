package com.alice.gametracker.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.alice.gametracker.service.UserDetailsServiceImpl;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Autowired
    UserDetailsServiceImpl userDetailsService;
    
    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;
    
    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }
    
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> 
                auth
                    // === PUBLIC ENDPOINTS (No Authentication Required) ===
                    
                    // Authentication endpoints - public
                    .requestMatchers("/api/auth/login").permitAll()
                    .requestMatchers("/api/auth/test").permitAll()
                    .requestMatchers("/api/auth/forgot-password").permitAll()
                    .requestMatchers("/api/auth/reset-password").permitAll()
                    .requestMatchers("/api/auth/verify-email").permitAll()
                    .requestMatchers("/api/auth/oauth2/code").permitAll()
                    
                    // Account registration and utility endpoints - public  
                    .requestMatchers("/api/account/register").permitAll()
                    .requestMatchers("/api/account/check-username").permitAll()
                    .requestMatchers("/api/account/check-email").permitAll()
                    
                    // Avatar files - public (no authentication required for viewing avatars)
                    .requestMatchers("/api/account/avatar/**").permitAll()

                    // Character images - public (serve character images without auth)
                    .requestMatchers("/api/characters/image/**").permitAll()
                    .requestMatchers("/api/characters/cards").permitAll()

                    // Element icons - public (serve element icons without auth)
                    .requestMatchers("/api/elements/icon/**").permitAll()
                    .requestMatchers("/api/elements/icons").permitAll()

                    // Role icons - public (icons served from /api/roles/icon/{filename})
                    .requestMatchers("/api/roles/icon/**").permitAll()
                    
                    // Weapon images - public (serve weapon images without auth)
                    .requestMatchers("/api/weapons/image/**").permitAll()
                    .requestMatchers("/api/weapons/cards").permitAll()
                    // Echo images - public
                    .requestMatchers("/api/echoes/image/**").permitAll()
                    
                    // Upload files - public
                    .requestMatchers("/uploads/**").permitAll()
                    .requestMatchers("/api/background/**").permitAll()
                    
                    // Account management - requires authentication
                    .requestMatchers("/api/account/resend-verification").authenticated()
                    .requestMatchers("/api/account/profile").authenticated()
                    .requestMatchers("/api/account/change-password").authenticated()
                    .requestMatchers("/api/account/change-email").authenticated()
                    .requestMatchers("/api/account/upload-avatar").authenticated()
                    .requestMatchers("/api/account/{id}").hasRole("ADMIN")
                    
                    // Public API endpoints for future use
                    .requestMatchers("/api/public/**").permitAll()
                    .requestMatchers("/api/gacha/**").permitAll()
                    
                    // Game data - public read access
                    .requestMatchers("GET", "/api/roles").permitAll()
                    .requestMatchers("GET", "/api/roles/active").permitAll()
                    .requestMatchers("GET", "/api/roles/{id}").permitAll()
                    .requestMatchers("GET", "/api/characters").permitAll()
                    .requestMatchers("GET", "/api/characters/active").permitAll()
                    .requestMatchers("GET", "/api/characters/{id}").permitAll()
                    // Weapons - public read
                    .requestMatchers("GET", "/api/weapons").permitAll()
                    .requestMatchers("GET", "/api/weapons/active").permitAll()
                    .requestMatchers("GET", "/api/weapons/{id}").permitAll()
                    // Echoes - public read
                    .requestMatchers("GET", "/api/echoes").permitAll()
                    .requestMatchers("GET", "/api/echoes/active").permitAll()
                    .requestMatchers("GET", "/api/echoes/{id}").permitAll()
                    
                    // SetEcho icons - public (icons served from /api/set-echoes/icon/{filename})
                    .requestMatchers("/api/set-echoes/icon/**").permitAll()
                    // SetEcho - public read
                    .requestMatchers("GET", "/api/set-echoes").permitAll()
                    .requestMatchers("GET", "/api/set-echoes/active").permitAll()
                    .requestMatchers("GET", "/api/set-echoes/{id}").permitAll()
                    
                    // Banner - public read access for viewing banners
                    .requestMatchers("GET", "/api/banners").permitAll()
                    .requestMatchers("GET", "/api/banners/current").permitAll()
                    .requestMatchers("GET", "/api/banners/upcoming").permitAll()
                    .requestMatchers("GET", "/api/banners/history").permitAll()
                    .requestMatchers("GET", "/api/banners/featured-ids").permitAll()
                    .requestMatchers("GET", "/api/banners/{id}").permitAll()
                    .requestMatchers("POST", "/api/banners/gacha").permitAll() // Allow public gacha for now
                    
                    // Game data management - requires ADMIN role
                    .requestMatchers("/api/roles/**").hasRole("ADMIN")
                    .requestMatchers("/api/characters/**").hasRole("ADMIN")
                    .requestMatchers("/api/weapons/**").hasRole("ADMIN")
                    .requestMatchers("/api/set-echoes/**").hasRole("ADMIN")
                    .requestMatchers("/api/echoes/**").hasRole("ADMIN")
                    .requestMatchers("/api/banners/**").hasRole("ADMIN")
                    
                    // === DEFAULT ===
                    // All other requests require authentication
                    .anyRequest().authenticated()
            );
        
        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(false);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
