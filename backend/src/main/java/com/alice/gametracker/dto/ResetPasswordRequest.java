package com.alice.gametracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {
    
    @NotBlank(message = "Email hoặc username không được để trống")
    private String usernameOrEmail;
    
    @NotBlank(message = "Mã xác nhận không được để trống")
    @Pattern(regexp = "\\d{6}", message = "Mã xác nhận phải là 6 chữ số")
    private String resetCode;
    
    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String newPassword;
    
    @NotBlank(message = "Xác nhận mật khẩu không được để trống")
    private String confirmPassword;
    
    // Constructor
    public ResetPasswordRequest() {}
    
    public ResetPasswordRequest(String usernameOrEmail, String resetCode, String newPassword, String confirmPassword) {
        this.usernameOrEmail = usernameOrEmail;
        this.resetCode = resetCode;
        this.newPassword = newPassword;
        this.confirmPassword = confirmPassword;
    }
    
    // Getters and Setters
    public String getUsernameOrEmail() {
        return usernameOrEmail;
    }
    
    public void setUsernameOrEmail(String usernameOrEmail) {
        this.usernameOrEmail = usernameOrEmail;
    }
    
    public String getResetCode() {
        return resetCode;
    }
    
    public void setResetCode(String resetCode) {
        this.resetCode = resetCode;
    }
    
    public String getNewPassword() {
        return newPassword;
    }
    
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
    
    public String getConfirmPassword() {
        return confirmPassword;
    }
    
    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
}
