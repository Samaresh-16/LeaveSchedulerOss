package com.sap.fsad.leaveApp.controller.graphql;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.sap.fsad.leaveApp.dto.response.LeaveBalanceResponse;
import com.sap.fsad.leaveApp.dto.response.UserResponse;
import com.sap.fsad.leaveApp.service.UserService;

@Controller
public class UserGraphQLController {

    @Autowired
    private UserService userService;

    @QueryMapping
    public UserResponse getCurrentUserProfile() {
        return userService.convertToUserResponse(userService.getCurrentUser());
    }

    @QueryMapping
    public List<LeaveBalanceResponse> getCurrentUserLeaveBalances() {
        return userService.getCurrentUserLeaveBalances();
    }

    @QueryMapping
    public List<LeaveBalanceResponse> getUserLeaveBalances(@Argument Long userId) {
        return userService.getUserLeaveBalances(userId);
    }
}
