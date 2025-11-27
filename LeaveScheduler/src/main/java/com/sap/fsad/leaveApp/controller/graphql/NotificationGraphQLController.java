package com.sap.fsad.leaveApp.controller.graphql;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.sap.fsad.leaveApp.dto.response.ApiResponse;
import com.sap.fsad.leaveApp.model.Notification;
import com.sap.fsad.leaveApp.service.NotificationService;

@Controller
public class NotificationGraphQLController {

    @Autowired
    private NotificationService notificationService;

    @QueryMapping
    public List<Notification> notifications() {
        return notificationService.getCurrentUserNotifications();
    }

    @QueryMapping
    public List<Notification> unreadNotifications() {
        return notificationService.getCurrentUserUnreadNotifications();
    }

    @QueryMapping
    public Long unreadNotificationCount() {
        return notificationService.getCurrentUserUnreadNotificationCount();
    }

    @MutationMapping
    public Notification markNotificationAsRead(@Argument Long id) {
        notificationService.markNotificationAsRead(id);
        return notificationService.getCurrentUserNotifications().stream()
                .filter(n -> n.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    @MutationMapping
    public ApiResponse markAllNotificationsAsRead() {
        notificationService.markAllNotificationsAsRead();
        return new ApiResponse(true, "All notifications marked as read");
    }
}