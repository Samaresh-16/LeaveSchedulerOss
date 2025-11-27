package com.sap.fsad.leaveApp.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sap.fsad.leaveApp.dto.request.LeaveApplicationRequest;
import com.sap.fsad.leaveApp.dto.response.ApiResponse;
import com.sap.fsad.leaveApp.dto.response.CalendarEventResponse;
import com.sap.fsad.leaveApp.dto.response.LeaveBalanceResponse;
import com.sap.fsad.leaveApp.dto.response.LeaveResponse;
import com.sap.fsad.leaveApp.logging.LogOperation;
import com.sap.fsad.leaveApp.model.enums.LeaveType;
import com.sap.fsad.leaveApp.service.LeaveService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/leave-applications")
@Tag(name = "Leave Management", description = "Endpoints for leave applications")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @LogOperation(value = "APPLY_LEAVE", entityType = "LeaveApplication", async = false)
    @PostMapping
    @Operation(summary = "Apply for leave")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<LeaveResponse> applyLeave(@Valid @RequestBody LeaveApplicationRequest request) {
        LeaveResponse response = leaveService.applyLeave(request);
        return ResponseEntity.ok(response);
    }

    @LogOperation(value = "GET_CURRENT_USER_LEAVES", entityType = "LeaveApplication")
    @GetMapping
    @Operation(summary = "Get current user's leave applications")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<LeaveResponse>> getCurrentUserLeaves() {
        List<LeaveResponse> leaves = leaveService.getCurrentUserLeaves();
        return ResponseEntity.ok(leaves);
    }

    @LogOperation(value = "GET_LEAVE_ELIGIBILITY", entityType = "LeaveBalance")
    @GetMapping("/eligibility")
    @Operation(summary = "Get leave eligibility details for the current user")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<LeaveBalanceResponse>> getLeaveEligibilityDetails() {
        List<LeaveBalanceResponse> eligibilityDetails = leaveService.getLeaveEligibilityDetails();
        return ResponseEntity.ok(eligibilityDetails);
    }

    @LogOperation(value = "GET_CURRENT_USER_PENDING_LEAVES", entityType = "LeaveApplication")
    @GetMapping("/pending")
    @Operation(summary = "Get current user's pending leave applications")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<LeaveResponse>> getCurrentUserPendingLeaves() {
        List<LeaveResponse> leaves = leaveService.getCurrentUserPendingLeaves();
        return ResponseEntity.ok(leaves);
    }

    @LogOperation(value = "GET_LEAVE_BY_ID", entityType = "LeaveApplication")
    @GetMapping("/{id}")
    @Operation(summary = "Get leave application by ID")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<LeaveResponse> getLeaveById(@PathVariable Long id) {
        LeaveResponse response = leaveService.getLeaveById(id);
        return ResponseEntity.ok(response);
    }

    @LogOperation(value = "WITHDRAW_LEAVE", entityType = "LeaveApplication", async = false)
    @PutMapping("/{id}/withdraw")
    @Operation(summary = "Withdraw a leave application")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse> withdrawLeave(@PathVariable Long id) {
        ApiResponse response = leaveService.withdrawLeave(id);
        return ResponseEntity.ok(response);
    }

    @LogOperation(value = "GET_LEAVE_HISTORY", entityType = "LeaveApplication")
    @GetMapping("/history")
    @Operation(summary = "Get current user's leave history")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<LeaveResponse>> getLeaveHistory() {
        List<LeaveResponse> history = leaveService.getCurrentUserLeaves();
        return ResponseEntity.ok(history);
    }

    @LogOperation(value = "GET_LEAVE_HISTORY_FILTERED", entityType = "LeaveApplication")
    @GetMapping("/filter-history")
    @Operation(summary = "Get leave history with optional filters")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<LeaveResponse>> getLeaveHistory(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) LeaveType leaveType) {
        List<LeaveResponse> history = leaveService.getLeaveHistory(startDate, endDate, leaveType);
        return ResponseEntity.ok(history);
    }

    @LogOperation(value = "GET_LEAVE_STATS", entityType = "LeaveApplication")
    @GetMapping("/stats")
    @Operation(summary = "Get current user's leave statistics")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<LeaveResponse.LeaveStats> getLeaveStats() {
        LeaveResponse.LeaveStats stats = leaveService.getCurrentUserLeaveStats();
        return ResponseEntity.ok(stats);
    }

    @LogOperation(value = "GET_CALENDAR_EVENTS", entityType = "CalendarEvent")
    @GetMapping("/calendar")
    @Operation(summary = "Get leave schedules and holidays for calendar integration")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<CalendarEventResponse>> getCalendarEvents(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String department,
            @RequestParam(required = true) Integer month,
            @RequestParam(required = true) Integer year) {
        List<CalendarEventResponse> events = leaveService.getCalendarEvents(userId, department, month, year);
        return ResponseEntity.ok(events);
    }
}