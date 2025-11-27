package com.sap.fsad.leaveApp.controller.graphql;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.sap.fsad.leaveApp.dto.request.LeaveApprovalRequest;
import com.sap.fsad.leaveApp.dto.response.ApiResponse;
import com.sap.fsad.leaveApp.dto.response.LeaveResponse;
import com.sap.fsad.leaveApp.service.LeaveApprovalService;

import jakarta.validation.Valid;

@Controller
public class LeaveApprovalGraphQLController {

    @Autowired
    private LeaveApprovalService leaveApprovalService;

    @QueryMapping
    // Authorize only MANAGER role using JWT token
    public List<LeaveResponse> pendingLeaveApplications() {
        return leaveApprovalService.getPendingLeaveApplications();
    }

    @QueryMapping
    // Authorize only MANAGER role using JWT token
    public List<LeaveResponse> approvedLeaveApplications() {
        return leaveApprovalService.getApprovedLeaveApplications();
    }

    @QueryMapping
    // Authorize only MANAGER role using JWT token
    public List<LeaveResponse> rejectedLeaveApplications() {
        return leaveApprovalService.getRejectedLeaveApplications();
    }

    @MutationMapping
    // Authorize only MANAGER role using JWT token
    public String approveLeave(@Argument Long id, @Argument @Valid LeaveApprovalRequest request) {
        ApiResponse response = leaveApprovalService.approveLeave(id, request);
        return response.getMessage();
    }

    @MutationMapping
    // Authorize only MANAGER role using JWT token
    public String rejectLeave(@Argument Long id, @Argument @Valid LeaveApprovalRequest request) {
        ApiResponse response = leaveApprovalService.rejectLeave(id, request);
        return response.getMessage();
    }
}