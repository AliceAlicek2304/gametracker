package com.alice.gametracker.dto;

import jakarta.validation.constraints.NotBlank;

public class ForgotPasswordRequest {
    
    @NotBlank(message = "Email hoặc username không được để trống")
    private String usernameOrEmail;
    
    // Constructor
    public ForgotPasswordRequest() {}
    
    public ForgotPasswordRequest(String usernameOrEmail) {
        this.usernameOrEmail = usernameOrEmail;
    }
    
    // Getters and Setters
    public String getUsernameOrEmail() {
        return usernameOrEmail;
    }
    
    public void setUsernameOrEmail(String usernameOrEmail) {
        this.usernameOrEmail = usernameOrEmail;
    }
}
