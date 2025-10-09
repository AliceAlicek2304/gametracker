package com.alice.gametracker.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {
    
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;
    
    private LocalDate birthday;
    
    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;
    private String avatar;
    
    // Constructors
    public UpdateProfileRequest() {}
    
    public UpdateProfileRequest(String fullName, String email, LocalDate birthday) {
        this.fullName = fullName;
        this.email = email;
        this.birthday = birthday;
    }
    
    // Getters and Setters
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public LocalDate getBirthday() {
        return birthday;
    }
    
    public void setBirthday(LocalDate birthday) {
        this.birthday = birthday;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getAvatar() {
        return avatar;
    }
    
    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
    
    @Override
    public String toString() {
        return "UpdateProfileRequest{" +
                "fullName='" + fullName + '\'' +
                ", birthday=" + birthday +
                ", email='" + email + '\'' +
                ", avatar='" + avatar + '\'' +
                '}';
    }
}
