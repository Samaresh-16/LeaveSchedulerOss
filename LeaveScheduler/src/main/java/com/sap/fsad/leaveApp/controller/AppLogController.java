package com.sap.fsad.leaveApp.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sap.fsad.leaveApp.model.AppLog;
import com.sap.fsad.leaveApp.service.AppLogService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/app-logs")
@RequiredArgsConstructor
@Tag(name = "Application Logs", description = "Endpoints for application operation logging and monitoring")
public class AppLogController {

    private final AppLogService appLogService;
    private final PagedResourcesAssembler<AppLog> pagedResourcesAssembler;

    @GetMapping
    @Operation(summary = "Get application logs with filtering and pagination")
    public ResponseEntity<PagedModel<EntityModel<AppLog>>> getLogs(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "timestamp") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDir,
            @Parameter(description = "Filter by operation name (partial match)") @RequestParam(required = false) String operation,
            @Parameter(description = "Filter by user ID") @RequestParam(required = false) String userId,
            @Parameter(description = "Filter by username (partial match)") @RequestParam(required = false) String username,
            @Parameter(description = "Filter by status (SUCCESS/FAILURE/INFO/WARNING)") @RequestParam(required = false) String status,
            @Parameter(description = "Filter by HTTP method") @RequestParam(required = false) String httpMethod,
            @Parameter(description = "Filter by entity type") @RequestParam(required = false) String entityType,
            @Parameter(description = "Filter by department") @RequestParam(required = false) String department,
            @Parameter(description = "Filter by IP address") @RequestParam(required = false) String ipAddress,
            @Parameter(description = "Start date filter (ISO format)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "End date filter (ISO format)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        Sort sort = Sort.by(sortDir.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Page<AppLog> logs = appLogService.searchLogs(operation, userId, username, status, httpMethod,
                entityType, department, startDate, endDate, ipAddress,
                PageRequest.of(page, size, sort));
        return ResponseEntity.ok(pagedResourcesAssembler.toModel(logs));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get application log statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = appLogService.getStatistics();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/recent-failures")
    @Operation(summary = "Get recent failed operations for monitoring")
    public ResponseEntity<PagedModel<EntityModel<AppLog>>> getRecentFailures(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<AppLog> failures = appLogService.getRecentFailures(PageRequest.of(page, size));
        return ResponseEntity.ok(pagedResourcesAssembler.toModel(failures));
    }

    @GetMapping("/authentication")
    @Operation(summary = "Get authentication related logs")
    public ResponseEntity<PagedModel<EntityModel<AppLog>>> getAuthenticationLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<AppLog> authLogs = appLogService.getAuthenticationLogs(PageRequest.of(page, size));
        return ResponseEntity.ok(pagedResourcesAssembler.toModel(authLogs));
    }

    @GetMapping("/critical")
    @Operation(summary = "Get critical operations (admin, delete, update)")
    public ResponseEntity<PagedModel<EntityModel<AppLog>>> getCriticalOperations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<AppLog> criticalOps = appLogService.getCriticalOperations(PageRequest.of(page, size));
        return ResponseEntity.ok(pagedResourcesAssembler.toModel(criticalOps));
    }

    @GetMapping("/slow-operations")
    @Operation(summary = "Get slow operations for performance monitoring")
    public ResponseEntity<PagedModel<EntityModel<AppLog>>> getSlowOperations(
            @Parameter(description = "Threshold in milliseconds") @RequestParam(defaultValue = "5000") Long thresholdMs,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<AppLog> slowOps = appLogService.getSlowOperations(thresholdMs, PageRequest.of(page, size));
        return ResponseEntity.ok(pagedResourcesAssembler.toModel(slowOps));
    }

    @GetMapping("/trace/{correlationId}")
    @Operation(summary = "Get logs by correlation ID for request tracing")
    public ResponseEntity<List<AppLog>> getLogsByCorrelationId(
            @Parameter(description = "Correlation ID to trace") @PathVariable String correlationId) {

        List<AppLog> traceLogs = appLogService.getLogsByCorrelationId(correlationId);
        return ResponseEntity.ok(traceLogs);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific log entry by ID")
    public ResponseEntity<AppLog> getLogById(@PathVariable Long id) {
        AppLog log = appLogService.getLogById(id);
        if (log != null) {
            return ResponseEntity.ok(log);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/cleanup")
    @Operation(summary = "Clean up old logs")
    public ResponseEntity<String> cleanupOldLogs(
            @Parameter(description = "Number of days to keep") @RequestParam(defaultValue = "90") int daysToKeep) {

        appLogService.cleanupOldLogs(daysToKeep);
        return ResponseEntity.ok("Old logs cleanup initiated for logs older than " + daysToKeep + " days");
    }

    @GetMapping("/my-activity")
    @Operation(summary = "Get current user's activity logs")
    public ResponseEntity<PagedModel<EntityModel<AppLog>>> getMyActivity(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        // This would need current user context - we'll implement this when integrating
        // with services
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard data for log monitoring")
    public ResponseEntity<Map<String, Object>> getDashboardData() {
        Map<String, Object> stats = appLogService.getStatistics();

        // Add recent failures count
        Page<AppLog> recentFailures = appLogService.getRecentFailures(PageRequest.of(0, 1));
        stats.put("hasRecentFailures", recentFailures.getTotalElements() > 0);

        // Add slow operations count
        Page<AppLog> slowOps = appLogService.getSlowOperations(5000L, PageRequest.of(0, 1));
        stats.put("slowOperationsCount", slowOps.getTotalElements());

        return ResponseEntity.ok(stats);
    }
}