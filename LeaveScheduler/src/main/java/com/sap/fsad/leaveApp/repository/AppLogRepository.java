package com.sap.fsad.leaveApp.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sap.fsad.leaveApp.model.AppLog;

@Repository
public interface AppLogRepository extends JpaRepository<AppLog, Long> {

    // Basic filtering methods
    Page<AppLog> findByOperationContainingIgnoreCase(String operation, Pageable pageable);

    Page<AppLog> findByUserId(String userId, Pageable pageable);

    Page<AppLog> findByUsername(String username, Pageable pageable);

    Page<AppLog> findByStatus(String status, Pageable pageable);

    Page<AppLog> findByHttpMethod(String httpMethod, Pageable pageable);

    Page<AppLog> findByEntityType(String entityType, Pageable pageable);

    Page<AppLog> findByDepartment(String department, Pageable pageable);

    // Date range filtering
    Page<AppLog> findByTimestampBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    Page<AppLog> findByTimestampAfter(LocalDateTime startDate, Pageable pageable);

    Page<AppLog> findByTimestampBefore(LocalDateTime endDate, Pageable pageable);

    // Combined filtering with multiple conditions
    @Query("SELECT a FROM AppLog a WHERE " +
            "(:operation IS NULL OR LOWER(a.operation) LIKE LOWER(CONCAT('%', :operation, '%'))) AND " +
            "(:userId IS NULL OR a.userId = :userId) AND " +
            "(:username IS NULL OR LOWER(a.username) LIKE LOWER(CONCAT('%', :username, '%'))) AND " +
            "(:status IS NULL OR a.status = :status) AND " +
            "(:httpMethod IS NULL OR a.httpMethod = :httpMethod) AND " +
            "(:entityType IS NULL OR a.entityType = :entityType) AND " +
            "(:department IS NULL OR a.department = :department) AND " +
            "(:startDate IS NULL OR a.timestamp >= :startDate) AND " +
            "(:endDate IS NULL OR a.timestamp <= :endDate) AND " +
            "(:ipAddress IS NULL OR a.ipAddress = :ipAddress)")
    Page<AppLog> findWithFilters(@Param("operation") String operation,
            @Param("userId") String userId,
            @Param("username") String username,
            @Param("status") String status,
            @Param("httpMethod") String httpMethod,
            @Param("entityType") String entityType,
            @Param("department") String department,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("ipAddress") String ipAddress,
            Pageable pageable);

    // Statistics and aggregation queries
    @Query("SELECT COUNT(a) FROM AppLog a WHERE a.status = 'SUCCESS'")
    Long countSuccessfulOperations();

    @Query("SELECT COUNT(a) FROM AppLog a WHERE a.status = 'FAILURE'")
    Long countFailedOperations();

    @Query("SELECT a.operation, COUNT(a) FROM AppLog a GROUP BY a.operation ORDER BY COUNT(a) DESC")
    List<Object[]> getOperationStatistics();

    @Query("SELECT a.userId, COUNT(a) FROM AppLog a WHERE a.userId IS NOT NULL GROUP BY a.userId ORDER BY COUNT(a) DESC")
    List<Object[]> getUserActivityStatistics();

    @Query("SELECT a.httpMethod, COUNT(a) FROM AppLog a GROUP BY a.httpMethod ORDER BY COUNT(a) DESC")
    List<Object[]> getHttpMethodStatistics();

    // Recent activity queries
    @Query("SELECT a FROM AppLog a WHERE a.status = 'FAILURE' ORDER BY a.timestamp DESC")
    Page<AppLog> findRecentFailures(Pageable pageable);

    @Query("SELECT a FROM AppLog a WHERE a.userId = :userId ORDER BY a.timestamp DESC")
    Page<AppLog> findRecentActivityByUser(@Param("userId") String userId, Pageable pageable);

    // Security and audit queries
    @Query("SELECT a FROM AppLog a WHERE a.operation LIKE '%LOGIN%' OR a.operation LIKE '%LOGOUT%' ORDER BY a.timestamp DESC")
    Page<AppLog> findAuthenticationLogs(Pageable pageable);

    @Query("SELECT a FROM AppLog a WHERE a.operation LIKE '%ADMIN%' OR a.operation LIKE '%DELETE%' OR a.operation LIKE '%UPDATE%' ORDER BY a.timestamp DESC")
    Page<AppLog> findCriticalOperations(Pageable pageable);

    // Performance monitoring
    @Query("SELECT a FROM AppLog a WHERE a.executionTimeMs > :thresholdMs ORDER BY a.executionTimeMs DESC")
    Page<AppLog> findSlowOperations(@Param("thresholdMs") Long thresholdMs, Pageable pageable);

    // Clean up old logs (for maintenance)
    @Query("DELETE FROM AppLog a WHERE a.timestamp < :cutoffDate")
    void deleteLogsOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);

    // Find logs by correlation ID for request tracing
    List<AppLog> findByCorrelationIdOrderByTimestamp(String correlationId);

    // Find logs by session ID
    Page<AppLog> findBySessionId(String sessionId, Pageable pageable);
}