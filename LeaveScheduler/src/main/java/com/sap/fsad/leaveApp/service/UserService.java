package com.sap.fsad.leaveApp.service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sap.fsad.leaveApp.dto.request.PasswordChangeRequest;
import com.sap.fsad.leaveApp.dto.response.ApiResponse;
import com.sap.fsad.leaveApp.dto.response.LeaveBalanceResponse;
import com.sap.fsad.leaveApp.dto.response.UserResponse;
import com.sap.fsad.leaveApp.exception.BadRequestException;
import com.sap.fsad.leaveApp.exception.ResourceNotFoundException;
import com.sap.fsad.leaveApp.model.LeaveBalance;
import com.sap.fsad.leaveApp.model.User;
import com.sap.fsad.leaveApp.model.enums.UserRole;
import com.sap.fsad.leaveApp.repository.LeaveBalanceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.sap.fsad.leaveApp.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    /**
     * Get current logged-in user
     */
    public User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    /**
     * Get user by ID
     */
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    /**
     * Get all users
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        // Validate current user has permission to view all users
        User currentUser = getCurrentUser();
        if (!hasAdminOrManagerRole(currentUser)) {
            throw new AccessDeniedException("You don't have permission to view all users");
        }

        List<User> users = userRepository.findAllWithRoles();

        if (users.isEmpty()) {
            throw new ResourceNotFoundException("No users found in the system");
        }

        return users.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get users by manager ID with comprehensive validation
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByManagerId(Long managerId) {
        // Input validation
        if (managerId == null || managerId <= 0) {
            throw new BadRequestException("Manager ID must be a positive number");
        }

        // Check if manager exists
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + managerId));

        // Validate manager has appropriate role
        if (!hasManagerRole(manager)) {
            throw new BadRequestException("User with id " + managerId + " is not a manager or admin");
        }

        // Check if manager is active
        if (!manager.isActive()) {
            throw new BadRequestException("Manager with id " + managerId + " is not active");
        }

        // Permission check - users can only view their own managed users unless they're
        // admin
        User currentUser = getCurrentUser();
        if (!hasAdminRole(currentUser) && !currentUser.getId().equals(managerId)) {
            throw new AccessDeniedException("You can only view users managed by yourself");
        }

        List<User> managedUsers = userRepository.findByManagerIdWithRoles(managerId);

        // Optional: Throw exception if no managed users (or return empty list based on
        // requirements)
        if (managedUsers.isEmpty()) {
            throw new ResourceNotFoundException("No users found under manager with id: " + managerId);
        }

        return managedUsers.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Alternative version - returns empty list instead of throwing exception for no
     * managed users
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByManagerIdSafe(Long managerId) {
        // Input validation
        if (managerId == null || managerId <= 0) {
            throw new BadRequestException("Manager ID must be a positive number");
        }

        // Check if manager exists
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + managerId));

        // Validate manager has appropriate role
        if (!hasManagerRole(manager)) {
            throw new BadRequestException("User with id " + managerId + " is not a manager or admin");
        }

        // Check if manager is active
        if (!manager.isActive()) {
            throw new BadRequestException("Manager with id " + managerId + " is not active");
        }

        // Permission check
        User currentUser = getCurrentUser();
        if (!hasAdminRole(currentUser) && !currentUser.getId().equals(managerId)) {
            throw new AccessDeniedException("You can only view users managed by yourself");
        }

        // Return managed users (empty list if none found)
        return userRepository.findByManagerIdWithRoles(managerId)
                .stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Helper method to check if user has admin role
     */
    private boolean hasAdminRole(User user) {
        return user.getRoles() != null && user.getRoles().contains(UserRole.ADMIN);
    }

    /**
     * Helper method to check if user has manager role (includes admin)
     */
    private boolean hasManagerRole(User user) {
        return user.getRoles() != null &&
                (user.getRoles().contains(UserRole.MANAGER) || user.getRoles().contains(UserRole.ADMIN));
    }

    /**
     * Helper method to check if user has admin or manager role
     */
    private boolean hasAdminOrManagerRole(User user) {
        return hasManagerRole(user);
    }

    /**
     * Change password
     */
    public ApiResponse changePassword(PasswordChangeRequest request) {
        User currentUser = getCurrentUser();

        // Check if current password matches
        if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        // Check if new password and confirm password match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password don't match");
        }

        // Update password
        currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        currentUser.setUpdatedAt(LocalDateTime.now());
        userRepository.save(currentUser);

        return new ApiResponse(true, "Password changed successfully");
    }

    /**
     * Get leave balances for current user
     */
    public List<LeaveBalanceResponse> getCurrentUserLeaveBalances() {
        User currentUser = getCurrentUser();
        int currentYear = LocalDateTime.now().getYear();

        List<LeaveBalance> leaveBalances = leaveBalanceRepository.findByUserAndYear(currentUser, currentYear);

        List<LeaveBalanceResponse> balanceResponses = leaveBalances.stream()
                .map(this::convertToLeaveBalanceResponse)
                .collect(Collectors.toList());

        return balanceResponses;
    }

    /**
     * Get leave balances for user by ID
     */
    public List<LeaveBalanceResponse> getUserLeaveBalances(Long userId) {
        User user = getUserById(userId);
        int currentYear = LocalDateTime.now().getYear();

        List<LeaveBalance> leaveBalances = leaveBalanceRepository.findByUserAndYear(user, currentYear);

        List<LeaveBalanceResponse> balanceResponses = leaveBalances.stream()
                .map(this::convertToLeaveBalanceResponse)
                .collect(Collectors.toList());

        return balanceResponses;
    }

    /**
     * Convert User to UserResponse
     */
    public UserResponse convertToUserResponse(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());

        // Safely handle roles with proper error handling
        try {
            response.setRoles(user.getRoles() != null ? new HashSet<>(user.getRoles()) : Collections.emptySet());
        } catch (Exception e) {
            logger.warn("Error loading roles for user {}: {}", user.getId(), e.getMessage());
            response.setRoles(Collections.emptySet());
        }

        response.setDepartment(user.getDepartment());
        response.setManagerId(user.getManager() != null ? user.getManager().getId() : null);
        response.setManagerName(user.getManager() != null ? user.getManager().getFullName() : null);
        response.setJoiningDate(user.getJoiningDate());
        response.setPhone(user.getPhone());
        response.setEmergencyContact(user.getEmergencyContact());
        response.setActive(user.isActive());
        response.setLastLogin(user.getLastLogin());
        return response;
    }

    /**
     * Convert LeaveBalance to LeaveBalanceResponse
     */
    private LeaveBalanceResponse convertToLeaveBalanceResponse(LeaveBalance leaveBalance) {
        LeaveBalanceResponse response = new LeaveBalanceResponse();
        response.setId(leaveBalance.getId());
        response.setUserId(leaveBalance.getUser().getId());
        response.setLeaveType(leaveBalance.getLeaveType());
        response.setLeaveTypeName(leaveBalance.getLeaveType().toString());
        response.setBalance(leaveBalance.getBalance());
        response.setUsed(leaveBalance.getUsed());
        response.setYear(leaveBalance.getYear());

        return response;
    }
}