package com.booking.controller;

import com.booking.common.ApiResponse;
import com.booking.entity.Notification;
import com.booking.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public ApiResponse<List<Notification>> getUserNotifications(@PathVariable Integer userId) {
        return ApiResponse.success(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/user/{userId}/unread-count")
    public ApiResponse<Map<String, Long>> getUnreadCount(@PathVariable Integer userId) {
        long count = notificationService.getUnreadCount(userId);
        return ApiResponse.success(Map.of("count", count));
    }

    @PutMapping("/{notifId}/read")
    public ApiResponse<Void> markAsRead(@PathVariable Integer notifId) {
        notificationService.markAsRead(notifId);
        return ApiResponse.success("已标记为已读");
    }

    @PutMapping("/user/{userId}/read-all")
    public ApiResponse<Void> markAllAsRead(@PathVariable Integer userId) {
        notificationService.markAllAsRead(userId);
        return ApiResponse.success("全部已读");
    }
}
