package com.sap.fsad.leaveApp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sap.fsad.leaveApp.dto.response.ApiResponse;
import com.sap.fsad.leaveApp.logging.LogOperation;
import com.sap.fsad.leaveApp.model.Notification;
import com.sap.fsad.leaveApp.service.NotificationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notification Management", description = "Endpoints for managing notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @LogOperation(value = "GET_CURRENT_USER_NOTIFICATIONS", entityType = "Notification", includeResponseBody = false)
    @GetMapping
    @Operation(summary = "Get current user's notifications")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<Notification>> getCurrentUserNotifications() {
        List<Notification> notifications = notificationService.getCurrentUserNotifications();
        return ResponseEntity.ok(notifications);
    }

    @LogOperation(value = "GET_UNREAD_NOTIFICATIONS", entityType = "Notification", includeResponseBody = false)
    @GetMapping("/unread")
    @Operation(summary = "Get current user's unread notifications")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<Notification>> getCurrentUserUnreadNotifications() {
        List<Notification> notifications = notificationService.getCurrentUserUnreadNotifications();
        return ResponseEntity.ok(notifications);
    }

    @LogOperation(value = "GET_UNREAD_NOTIFICATION_COUNT", entityType = "Notification", includeResponseBody = false)
    @GetMapping("/unread-count")
    @Operation(summary = "Get count of unread notifications")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Long> getCurrentUserUnreadNotificationCount() {
        long count = notificationService.getCurrentUserUnreadNotificationCount();
        return ResponseEntity.ok(count);
    }

    @LogOperation(value = "MARK_NOTIFICATION_READ", entityType = "Notification", async = false, includeResponseBody = false)
    @PutMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<String> markNotificationAsRead(@PathVariable Long id) {
        notificationService.markNotificationAsRead(id);
        return ResponseEntity.ok("Notification marked as read successfully");
    }

    @LogOperation(value = "MARK_ALL_NOTIFICATIONS_READ", entityType = "Notification", async = false, includeResponseBody = false)
    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse> markAllNotificationsAsRead() {
        notificationService.markAllNotificationsAsRead();
        return ResponseEntity.ok(new ApiResponse(true, "All notifications marked as read"));
    }
}