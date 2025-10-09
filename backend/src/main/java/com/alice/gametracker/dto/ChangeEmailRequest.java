package com.alice.gametracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChangeEmailRequest {
    
    @NotBlank(message = "New email is required")
    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String newEmail;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    // Constructors
    public ChangeEmailRequest() {}
    
    public ChangeEmailRequest(String newEmail, String password) {
        this.newEmail = newEmail;
        this.password = password;
    }
    
    // Getters and Setters
    public String getNewEmail() {
        return newEmail;
    }
    
    public void setNewEmail(String newEmail) {
        this.newEmail = newEmail;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
}
