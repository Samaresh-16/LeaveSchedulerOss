package com.sap.fsad.leaveApp.service;

import java.time.LocalDateTime;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sap.fsad.leaveApp.model.AppLog;
import com.sap.fsad.leaveApp.model.User;
import com.sap.fsad.leaveApp.repository.AppLogRepository;
import com.sap.fsad.leaveApp.security.CustomUserDetails;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppLogService {

    private final AppLogRepository appLogRepository;
    private final ObjectMapper objectMapper;

    /**
     * Log operation synchronously (for critical operations that need immediate
     * logging)
     */
    public void logSync(String operation, String entityType, String entityId, String status, String message) {
        try {
            AppLog appLog = createAppLog(operation, entityType, entityId, status, message, null, null, null);
            appLogRepository.save(appLog);
        } catch (Exception e) {
            // Silent fail to avoid breaking main operation
            log.error("Failed to save app log synchronously: {}", e.getMessage(), e);
        }
    }

    /**
     * Log operation synchronously with HTTP context (for critical operations that
     * need immediate logging)
     */
    public void logSyncWithContext(String operation, String entityType, String entityId, String status, String message,
            String httpMethod, String requestUri) {
        try {
            AppLog appLog = createAppLogWithContext(operation, entityType, entityId, status, message,
                    null, null, null, httpMethod, requestUri);
            appLogRepository.save(appLog);
        } catch (Exception e) {
            // Silent fail to avoid breaking main operation
            log.error("Failed to save app log synchronously with context: {}", e.getMessage(), e);
        }
    }

    /**
     * Log operation asynchronously (for better performance)
     */
    @Async
    public void logAsync(String operation, String entityType, String entityId, String status, String message) {
        try {
            AppLog appLog = createAppLog(operation, entityType, entityId, status, message, null, null, null);
            appLogRepository.save(appLog);
        } catch (Exception e) {
            log.error("Failed to save app log asynchronously: {}", e.getMessage(), e);
        }
    }

    /**
     * Log operation with request/response details (for comprehensive audit)
     */
    @Async
    public void logWithDetails(String operation, String entityType, String entityId, String status,
            String message, Object requestBody, Object responseBody, Long executionTimeMs) {
        try {
            AppLog appLog = createAppLog(operation, entityType, entityId, status, message,
                    requestBody, responseBody, executionTimeMs);
            appLogRepository.save(appLog);
        } catch (Exception e) {
            log.error("Failed to save detailed app log: {}", e.getMessage(), e);
        }
    }

    /**
     * Log operation with request/response details and HTTP context (for
     * comprehensive audit)
     */
    @Async
    public void logWithDetailsAndContext(String operation, String entityType, String entityId, String status,
            String message, Object requestBody, Object responseBody, Long executionTimeMs,
            String httpMethod, String requestUri) {
        try {
            AppLog appLog = createAppLogWithContext(operation, entityType, entityId, status, message,
                    requestBody, responseBody, executionTimeMs, httpMethod, requestUri);
            appLogRepository.save(appLog);
        } catch (Exception e) {
            log.error("Failed to save detailed app log with context: {}", e.getMessage(), e);
        }
    }

    /**
     * Log operation with full request details captured from aspect (for
     * comprehensive audit)
     */
    @Async
    public void logWithFullContext(String operation, String entityType, String entityId, String status,
            String message, Object requestBody, Object responseBody, Long executionTimeMs,
            String httpMethod, String requestUri, String ipAddress, String userAgent,
            String correlationId) {
        try {
            AppLog appLog = createAppLogWithFullContext(operation, entityType, entityId, status, message,
                    requestBody, responseBody, executionTimeMs, httpMethod,
                    requestUri, ipAddress, userAgent, correlationId);
            appLogRepository.save(appLog);
        } catch (Exception e) {
            log.error("Failed to save detailed app log with full context: {}", e.getMessage(), e);
        }
    }

    /**
     * Convenience methods for common operations
     */
    @Async
    public void logSuccess(String operation, String entityType, String entityId, String message) {
        logAsync(operation, entityType, entityId, "SUCCESS", message);
    }

    @Async
    public void logFailure(String operation, String entityType, String entityId, String message) {
        logAsync(operation, entityType, entityId, "FAILURE", message);
    }

    @Async
    public void logInfo(String operation, String entityType, String entityId, String message) {
        logAsync(operation, entityType, entityId, "INFO", message);
    }

    @Async
    public void logWarning(String operation, String entityType, String entityId, String message) {
        logAsync(operation, entityType, entityId, "WARNING", message);
    }

    /**
     * Create AppLog object with full context details (no request lookup needed)
     */
    private AppLog createAppLogWithFullContext(String operation, String entityType, String entityId, String status,
            String message, Object requestBody, Object responseBody, Long executionTimeMs,
            String httpMethod, String requestUri, String ipAddress, String userAgent,
            String correlationId) {
        User currentUser = getCurrentUserSafely();

        // Ensure required fields are never null
        String safeOperation = operation != null ? operation : "UNKNOWN_OPERATION";
        String safeStatus = status != null ? status : "INFO";
        String safeMessage = message != null ? message : "No message provided";

        return AppLog.builder()
                .timestamp(LocalDateTime.now())
                .operation(safeOperation)
                .entityType(entityType)
                .entityId(entityId)
                .status(safeStatus)
                .message(safeMessage)
                .userId(currentUser != null && currentUser.getId() != null ? currentUser.getId().toString()
                        : "anonymous")
                .username(currentUser != null ? currentUser.getUsername() : "anonymous")
                .department(currentUser != null ? currentUser.getDepartment() : null)
                .httpMethod(httpMethod)
                .requestUri(requestUri)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .correlationId(correlationId)
                .requestBody(requestBody != null ? serializeObject(requestBody) : null)
                .responseBody(responseBody != null ? serializeObject(responseBody) : null)
                .executionTimeMs(executionTimeMs)
                .build();
    }

    /**
     * Create AppLog object with comprehensive details
     */
    private AppLog createAppLog(String operation, String entityType, String entityId, String status,
            String message, Object requestBody, Object responseBody, Long executionTimeMs) {
        User currentUser = getCurrentUserSafely();
        HttpServletRequest request = getCurrentRequest();

        // Ensure required fields are never null
        String safeOperation = operation != null ? operation : "UNKNOWN_OPERATION";
        String safeStatus = status != null ? status : "INFO";
        String safeMessage = message != null ? message : "No message provided";

        return AppLog.builder()
                .timestamp(LocalDateTime.now())
                .operation(safeOperation)
                .entityType(entityType)
                .entityId(entityId)
                .status(safeStatus)
                .message(safeMessage)
                .userId(currentUser != null && currentUser.getId() != null ? currentUser.getId().toString()
                        : "anonymous")
                .username(currentUser != null ? currentUser.getUsername() : "anonymous")
                .department(currentUser != null ? currentUser.getDepartment() : null)
                .httpMethod(request != null ? request.getMethod() : null)
                .requestUri(request != null ? request.getRequestURI() : null)
                .ipAddress(request != null ? getClientIpAddress(request) : null)
                .userAgent(request != null ? request.getHeader("User-Agent") : null)
                .sessionId(
                        request != null ? request.getSession(false) != null ? request.getSession(false).getId() : null
                                : null)
                .correlationId(request != null ? getOrCreateCorrelationId(request) : null)
                .requestBody(requestBody != null ? serializeObject(requestBody) : null)
                .responseBody(responseBody != null ? serializeObject(responseBody) : null)
                .requestHeaders(request != null ? getRequestHeaders(request) : null)
                .executionTimeMs(executionTimeMs)
                .build();
    }

    /**
     * Create AppLog object with comprehensive details and provided HTTP context
     */
    private AppLog createAppLogWithContext(String operation, String entityType, String entityId, String status,
            String message, Object requestBody, Object responseBody, Long executionTimeMs,
            String httpMethod, String requestUri) {
        User currentUser = getCurrentUserSafely();
        HttpServletRequest request = getCurrentRequest();

        // Ensure required fields are never null
        String safeOperation = operation != null ? operation : "UNKNOWN_OPERATION";
        String safeStatus = status != null ? status : "INFO";
        String safeMessage = message != null ? message : "No message provided";

        return AppLog.builder()
                .timestamp(LocalDateTime.now())
                .operation(safeOperation)
                .entityType(entityType)
                .entityId(entityId)
                .status(safeStatus)
                .message(safeMessage)
                .userId(currentUser != null && currentUser.getId() != null ? currentUser.getId().toString()
                        : "anonymous")
                .username(currentUser != null ? currentUser.getUsername() : "anonymous")
                .department(currentUser != null ? currentUser.getDepartment() : null)
                .httpMethod(httpMethod != null ? httpMethod : (request != null ? request.getMethod() : null))
                .requestUri(requestUri != null ? requestUri : (request != null ? request.getRequestURI() : null))
                .ipAddress(request != null ? getClientIpAddress(request) : null)
                .userAgent(request != null ? request.getHeader("User-Agent") : null)
                .sessionId(
                        request != null ? request.getSession(false) != null ? request.getSession(false).getId() : null
                                : null)
                .correlationId(request != null ? getOrCreateCorrelationId(request) : null)
                .requestBody(requestBody != null ? serializeObject(requestBody) : null)
                .responseBody(responseBody != null ? serializeObject(responseBody) : null)
                .requestHeaders(request != null ? getRequestHeaders(request) : null)
                .executionTimeMs(executionTimeMs)
                .build();
    }

    /**
     * Search logs with comprehensive filters
     */
    public Page<AppLog> searchLogs(String operation, String userId, String username, String status,
            String httpMethod, String entityType, String department,
            LocalDateTime startDate, LocalDateTime endDate, String ipAddress,
            Pageable pageable) {
        return appLogRepository.findWithFilters(operation, userId, username, status, httpMethod,
                entityType, department, startDate, endDate, ipAddress, pageable);
    }

    /**
     * Get operation statistics
     */
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLogs", appLogRepository.count());
        stats.put("successfulOperations", appLogRepository.countSuccessfulOperations());
        stats.put("failedOperations", appLogRepository.countFailedOperations());
        stats.put("operationBreakdown", appLogRepository.getOperationStatistics());
        stats.put("userActivity", appLogRepository.getUserActivityStatistics());
        stats.put("httpMethodBreakdown", appLogRepository.getHttpMethodStatistics());
        return stats;
    }

    /**
     * Get recent failures for monitoring
     */
    public Page<AppLog> getRecentFailures(Pageable pageable) {
        return appLogRepository.findRecentFailures(pageable);
    }

    /**
     * Get authentication related logs
     */
    public Page<AppLog> getAuthenticationLogs(Pageable pageable) {
        return appLogRepository.findAuthenticationLogs(pageable);
    }

    /**
     * Get critical operations (admin, delete, update)
     */
    public Page<AppLog> getCriticalOperations(Pageable pageable) {
        return appLogRepository.findCriticalOperations(pageable);
    }

    /**
     * Get slow operations for performance monitoring
     */
    public Page<AppLog> getSlowOperations(Long thresholdMs, Pageable pageable) {
        return appLogRepository.findSlowOperations(thresholdMs, pageable);
    }

    /**
     * Get logs by correlation ID for request tracing
     */
    public List<AppLog> getLogsByCorrelationId(String correlationId) {
        return appLogRepository.findByCorrelationIdOrderByTimestamp(correlationId);
    }

    public AppLog getLogById(Long id) {
        return appLogRepository.findById(id).orElse(null);
    }

    /**
     * Clean up old logs (maintenance operation)
     */
    public void cleanupOldLogs(int daysToKeep) {
        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);
            appLogRepository.deleteLogsOlderThan(cutoffDate);
            log.info("Cleaned up app logs older than {} days", daysToKeep);
        } catch (Exception e) {
            log.error("Failed to cleanup old logs: {}", e.getMessage(), e);
        }
    }

    /**
     * Helper methods
     */
    private User getCurrentUserSafely() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

            if (principal == null || principal.equals("anonymousUser") || !(principal instanceof CustomUserDetails)) {
                return null;
            }

            CustomUserDetails userDetails = (CustomUserDetails) principal;

            User user = new User();
            user.setId(userDetails.getId());
            user.setUsername(userDetails.getUsername());
            return user;
        } catch (Exception e) {
            return null;
        }
    }

    private HttpServletRequest getCurrentRequest() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attrs != null ? attrs.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    private String getOrCreateCorrelationId(HttpServletRequest request) {
        String correlationId = request.getHeader("X-Correlation-ID");
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }
        return correlationId;
    }

    private String getRequestHeaders(HttpServletRequest request) {
        try {
            Map<String, String> headers = new HashMap<>();
            Enumeration<String> headerNames = request.getHeaderNames();

            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                // Only include important headers, skip sensitive ones
                if (isImportantHeader(headerName)) {
                    headers.put(headerName, request.getHeader(headerName));
                }
            }

            return objectMapper.writeValueAsString(headers);
        } catch (Exception e) {
            return null;
        }
    }

    private boolean isImportantHeader(String headerName) {
        String lowerCaseHeader = headerName.toLowerCase();
        return lowerCaseHeader.equals("content-type") ||
                lowerCaseHeader.equals("accept") ||
                lowerCaseHeader.equals("user-agent") ||
                lowerCaseHeader.equals("x-forwarded-for") ||
                lowerCaseHeader.equals("x-real-ip") ||
                lowerCaseHeader.equals("x-correlation-id");
    }

    private String serializeObject(Object obj) {
        try {
            if (obj == null)
                return null;

            // Limit serialized size to prevent database issues
            String serialized = objectMapper.writeValueAsString(obj);
            if (serialized.length() > 10000) { // 10KB limit
                return serialized.substring(0, 10000) + "... [TRUNCATED]";
            }
            return serialized;
        } catch (Exception e) {
            return "Error serializing object: " + e.getMessage();
        }
    }
}