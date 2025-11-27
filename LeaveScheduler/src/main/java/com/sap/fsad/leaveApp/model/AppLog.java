package com.sap.fsad.leaveApp.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "app_logs", indexes = {
        @Index(name = "idx_app_logs_operation", columnList = "operation"),
        @Index(name = "idx_app_logs_user_id", columnList = "userId"),
        @Index(name = "idx_app_logs_timestamp", columnList = "timestamp"),
        @Index(name = "idx_app_logs_status", columnList = "status"),
        @Index(name = "idx_app_logs_entity_type", columnList = "entityType"),
        @Index(name = "idx_app_logs_method", columnList = "httpMethod")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    private String userId;
    private String username;

    @Column(nullable = false, length = 100)
    private String operation;

    @Column(length = 50)
    private String entityType;

    @Column(nullable = true)
    private String entityId;

    @Column(nullable = false, length = 20)
    private String status; // SUCCESS / FAILURE

    @Column(length = 2000)
    private String message;

    @Column(length = 10)
    private String httpMethod;

    @Column(length = 500)
    private String requestUri;

    @Column(length = 45)
    private String ipAddress;

    @Column(length = 1000)
    private String userAgent;

    @Column(length = 50)
    private String correlationId;

    // Request/Response logging fields
    @Column(columnDefinition = "TEXT")
    private String requestBody;

    @Column(columnDefinition = "TEXT")
    private String responseBody;

    @Column(length = 200)
    private String requestHeaders;

    @Column(length = 200)
    private String responseHeaders;

    private Integer responseStatus;

    private Long executionTimeMs;

    @Column(length = 100)
    private String sessionId;

    @Column(length = 50)
    private String department;

    @PrePersist
    void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
        if (operation == null || operation.trim().isEmpty()) {
            operation = "UNKNOWN_OPERATION";
        }
        if (status == null || status.trim().isEmpty()) {
            status = "INFO";
        }
        if (message == null) {
            message = "No message provided";
        }
    }
}