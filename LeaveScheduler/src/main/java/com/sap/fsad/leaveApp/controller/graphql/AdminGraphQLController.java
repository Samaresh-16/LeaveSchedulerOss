package com.sap.fsad.leaveApp.controller.graphql;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.sap.fsad.leaveApp.dto.request.LeavePolicyRequest;
import com.sap.fsad.leaveApp.dto.request.UserUpdateRequest;
import com.sap.fsad.leaveApp.dto.response.ApiResponse;
import com.sap.fsad.leaveApp.dto.response.DashboardStatsResponse;
import com.sap.fsad.leaveApp.dto.response.UserResponse;
import com.sap.fsad.leaveApp.model.LeavePolicy;
import com.sap.fsad.leaveApp.model.enums.LeaveType;
import com.sap.fsad.leaveApp.service.AdminService;
import com.sap.fsad.leaveApp.service.LeaveCreditService;
import com.sap.fsad.leaveApp.service.UserService;

@Controller
public class AdminGraphQLController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private LeaveCreditService leaveCreditService;

    @Autowired
    private UserService userService;

    // Query Resolvers
    @QueryMapping
    public DashboardStatsResponse getDashboardStats() {
        return adminService.getDashboardStats();
    }

    @QueryMapping
    public List<UserResponse> getAllUsers() {
        return adminService.getAllUsers();
    }

    @QueryMapping
    public List<UserResponse> getManagedUsers(@Argument Long managerId) {
        if (managerId == null) {
            // If no managerId provided, get managed users of current user
            return userService.getUsersByManagerId(userService.getCurrentUser().getId());
        }
        return userService.getUsersByManagerId(managerId);
    }

    @QueryMapping
    public List<LeavePolicy> getAllLeavePolicies() {
        return adminService.getAllLeavePolicies();
    }

    @QueryMapping
    public LeavePolicy getLeavePolicyById(@Argument String id) {
        return adminService.getLeavePolicyById(Long.parseLong(id));
    }

    // Mutation Resolvers
    @MutationMapping
    public UserResponse updateUser(@Argument String userId, @Argument UserUpdateRequest input) {
        return adminService.updateUser(Long.parseLong(userId), input);
    }

    @MutationMapping
    public LeavePolicy createOrUpdateLeavePolicy(@Argument LeavePolicyRequest input) {
        return adminService.createOrUpdateLeavePolicy(input);
    }

    @MutationMapping
    public ApiResponse deleteLeavePolicy(@Argument String id) {
        return adminService.deleteLeavePolicy(Long.parseLong(id));
    }

    @MutationMapping
    public ApiResponse creditAnnualLeaveForAllUsers() {
        return leaveCreditService.creditAnnualLeaveForAllUsers();
    }

    @MutationMapping
    public List<ApiResponse> creditSpecialLeave(@Argument List<Long> userIds, @Argument LeaveType leaveType,
            @Argument Float amount, @Argument String reason) {
        return leaveCreditService.creditSpecialLeave(userIds, leaveType, amount, reason);
    }
}