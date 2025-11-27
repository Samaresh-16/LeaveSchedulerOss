package com.sap.fsad.leaveApp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sap.fsad.leaveApp.dto.response.LeaveBalanceResponse;
import com.sap.fsad.leaveApp.dto.response.UserResponse;
import com.sap.fsad.leaveApp.logging.LogOperation;
import com.sap.fsad.leaveApp.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "Endpoints for user profile and management")
public class UserController {

    @Autowired
    private UserService userService;

    @LogOperation("GET_USER_PROFILE")
    @GetMapping("/profile")
    @Operation(summary = "Get current user profile")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<UserResponse> getCurrentUserProfile() {
        UserResponse response = userService.convertToUserResponse(userService.getCurrentUser());
        return ResponseEntity.ok(response);
    }

    @LogOperation("GET_USER_LEAVE_BALANCE")
    @GetMapping("/leave-balance")
    @Operation(summary = "Get current user leave balances")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<LeaveBalanceResponse>> getCurrentUserLeaveBalances() {
        List<LeaveBalanceResponse> balances = userService.getCurrentUserLeaveBalances();
        return ResponseEntity.ok(balances);
    }

    @LogOperation("GET_USER_LEAVE_BALANCE_BY_ID")
    @GetMapping("/{userId}/leave-balance")
    @Operation(summary = "Get user leave balance by ID")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<LeaveBalanceResponse>> getUserLeaveBalances(@PathVariable Long userId) {
        List<LeaveBalanceResponse> balances = userService.getUserLeaveBalances(userId);
        return ResponseEntity.ok(balances);
    }

    @LogOperation("GET_ALL_USERS")
    @GetMapping("/all")
    @Operation(summary = "Get all users")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @LogOperation("GET_MANAGED_USERS")
    @GetMapping("/managed")
    @Operation(summary = "Get managed users")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<UserResponse>> getManagedUsers() {
        List<UserResponse> users = userService.getUsersByManagerId(userService.getCurrentUser().getId());
        return ResponseEntity.ok(users);
    }
}