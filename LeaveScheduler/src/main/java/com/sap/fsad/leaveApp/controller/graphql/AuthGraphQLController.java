package com.sap.fsad.leaveApp.controller.graphql;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

import com.sap.fsad.leaveApp.dto.request.LoginRequest;
import com.sap.fsad.leaveApp.dto.request.PasswordChangeRequest;
import com.sap.fsad.leaveApp.dto.request.RegisterRequest;
import com.sap.fsad.leaveApp.dto.response.ApiResponse;
import com.sap.fsad.leaveApp.dto.response.JwtResponse;
import com.sap.fsad.leaveApp.model.User;
import com.sap.fsad.leaveApp.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;

@Controller
public class AuthGraphQLController {

    @Autowired
    private AuthService authService;

    @MutationMapping
    @Operation(summary = "Authenticate user and return JWT token")
    public ApiResponse login(@Argument("loginRequest") LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.login(loginRequest);
        Map<String, Object> tokenData = new HashMap<>();
        tokenData.put("token", jwtResponse.getToken());
        tokenData.put("type", jwtResponse.getType());
        tokenData.put("userId", jwtResponse.getId());
        tokenData.put("username", jwtResponse.getUsername());
        tokenData.put("fullName", jwtResponse.getFullName());
        tokenData.put("email", jwtResponse.getEmail());
        tokenData.put("roles", jwtResponse.getRoles());
        return new ApiResponse(true, "Login successful", tokenData);
    }

    @MutationMapping
    public ApiResponse register(@Argument("registerRequest") RegisterRequest registerRequest) {
        User user = authService.register(registerRequest);
        return new ApiResponse(true, "User registered successfully", Map.of("userId", user.getId()));
    }

    @MutationMapping
    public ApiResponse registerBatch(@Argument("registerRequests") List<RegisterRequest> registerRequests) {
        List<User> users = authService.register(registerRequests);
        List<Long> userIds = users.stream().map(User::getId).collect(Collectors.toList());
        return new ApiResponse(true, users.size() + " users registered successfully",
                Map.of("userIds", userIds));
    }

    @MutationMapping
    public ApiResponse changePassword(@Argument("passwordChangeRequest") PasswordChangeRequest passwordChangeRequest) {
        return authService.changePassword(passwordChangeRequest);
    }

    @MutationMapping
    public ApiResponse forgotPassword(@Argument String email) {
        authService.forgotPassword(email);
        return new ApiResponse(true, "Password reset email sent successfully");
    }

    @MutationMapping
    public ApiResponse resetPassword(@Argument String token, @Argument String newPassword) {
        authService.resetPassword(token, newPassword);
        return new ApiResponse(true, "Password reset successfully");
    }

    @MutationMapping
    public ApiResponse logout(@Argument String token) {
        return authService.logout(token);
    }
}
