package com.sap.fsad.leaveApp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sap.fsad.leaveApp.dto.request.LoginRequest;
import com.sap.fsad.leaveApp.dto.request.PasswordChangeRequest;
import com.sap.fsad.leaveApp.dto.request.RegisterRequest;
import com.sap.fsad.leaveApp.dto.response.ApiResponse;
import com.sap.fsad.leaveApp.dto.response.JwtResponse;
import com.sap.fsad.leaveApp.logging.LogOperation;
import com.sap.fsad.leaveApp.model.User;
import com.sap.fsad.leaveApp.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication and registration")
public class AuthController {

    @Autowired
    private AuthService authService;

    @LogOperation("USER_LOGIN")
    @PostMapping("/login")
    @Operation(summary = "User login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @LogOperation("USER_REGISTER")
    @PostMapping("/register")
    @Operation(summary = "User registration")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        authService.register(registerRequest);
        return ResponseEntity.ok(new ApiResponse(true, "User registered successfully"));
    }

    @LogOperation("USER_REGISTER_BATCH")
    @PostMapping("/register/batch")
    @Operation(summary = "Batch user registration")
    public ResponseEntity<ApiResponse> registerBatch(@Valid @RequestBody List<RegisterRequest> registerRequests) {
        List<User> registeredUsers = authService.register(registerRequests);
        return ResponseEntity.ok(new ApiResponse(true, "Successfully registered " + registeredUsers.size() + " users"));
    }

    @LogOperation("CHANGE_PASSWORD")
    @PostMapping("/change-password")
    @Operation(summary = "Change user password")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse> changePassword(@Valid @RequestBody PasswordChangeRequest passwordChangeRequest) {
        authService.changePassword(passwordChangeRequest);
        return ResponseEntity.ok(new ApiResponse(true, "Password changed successfully"));
    }

    @LogOperation("FORGOT_PASSWORD")
    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset")
    public ResponseEntity<ApiResponse> forgotPassword(@RequestParam String email) {
        authService.forgotPassword(email);
        return ResponseEntity.ok(new ApiResponse(true, "Reset password link sent to email"));
    }

    @LogOperation("RESET_PASSWORD")
    @PostMapping("/reset-password")
    @Operation(summary = "Reset user password")
    public ResponseEntity<ApiResponse> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        authService.resetPassword(token, newPassword);
        return ResponseEntity.ok(new ApiResponse(true, "Password reset successfully"));
    }

    @LogOperation(value = "USER_LOGOUT", entityType = "User", async = false)
    @PostMapping("/logout")
    @Operation(summary = "User logout")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse> logout(HttpServletRequest request) {
        authService.logout(request.getHeader("Authorization"));
        return ResponseEntity.ok(new ApiResponse(true, "User logged out successfully"));
    }
}