package com.sap.fsad.leaveApp.controller.graphql;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.sap.fsad.leaveApp.dto.request.LeaveApplicationRequest;
import com.sap.fsad.leaveApp.dto.response.ApiResponse;
import com.sap.fsad.leaveApp.dto.response.LeaveBalanceResponse;
import com.sap.fsad.leaveApp.dto.response.LeaveResponse;
import com.sap.fsad.leaveApp.model.enums.LeaveType;
import com.sap.fsad.leaveApp.service.LeaveService;
import com.sap.fsad.leaveApp.service.UserService;

import lombok.Data;

@Controller
public class LeaveGraphQLController {

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private UserService userService;

    @QueryMapping
    public List<LeaveBalanceResponse> userLeaveBalances(@Argument Long userId) {
        return userService.getUserLeaveBalances(userId);
    }

    @Data
    public static class LeaveApplicationInput {
        private LocalDate startDate;
        private LocalDate endDate;
        private String reason;
        private String leaveType;
    }

    @QueryMapping
    public List<LeaveResponse> currentUserLeaves() {
        return leaveService.getCurrentUserLeaves();
    }

    @QueryMapping
    public List<LeaveResponse> managedUsers() {
        // This returns leaves of managed users, not the users themselves
        return leaveService.getCurrentUserLeaves();
    }

    @MutationMapping
    public LeaveResponse applyLeave(@Argument LeaveApplicationInput request) {
        LeaveApplicationRequest leaveRequest = new LeaveApplicationRequest();
        leaveRequest.setStartDate(request.getStartDate());
        leaveRequest.setEndDate(request.getEndDate());
        leaveRequest.setReason(request.getReason());
        leaveRequest.setLeaveType(LeaveType.valueOf(request.getLeaveType()));
        return leaveService.applyLeave(leaveRequest);
    }

    @QueryMapping
    public List<LeaveBalanceResponse> getLeaveEligibilityDetails() {
        return leaveService.getLeaveEligibilityDetails();
    }

    @QueryMapping
    public List<LeaveResponse> getCurrentUserPendingLeaves() {
        return leaveService.getCurrentUserPendingLeaves();
    }

    @QueryMapping
    public LeaveResponse getLeaveById(@Argument Long id) {
        return leaveService.getLeaveById(id);
    }

    @MutationMapping
    public String withdrawLeave(@Argument Long id) {
        ApiResponse response = leaveService.withdrawLeave(id);
        return response.getMessage();
    }

    @QueryMapping
    public List<LeaveResponse> getLeaveHistory() {
        return leaveService.getLeaveHistory(null, null, null);
    }

    @QueryMapping
    public List<LeaveResponse> getLeaveHistoryWithFilters(@Argument LocalDate startDate, @Argument LocalDate endDate,
            @Argument String leaveType) {
        LeaveType type = leaveType != null ? LeaveType.valueOf(leaveType) : null;
        return leaveService.getLeaveHistory(startDate, endDate, type);
    }

    @QueryMapping
    public LeaveResponse.LeaveStats getLeaveStats() {
        return leaveService.getCurrentUserLeaveStats();
    }
}
