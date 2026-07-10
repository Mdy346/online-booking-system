package com.booking.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.booking.entity.Notification;
import com.booking.mapper.NotificationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService extends ServiceImpl<NotificationMapper, Notification> {

    public void createNotification(Integer userId, String title, String message, String relatedType, Integer relatedId) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setTitle(title);
        n.setMessage(message);
        n.setRelatedType(relatedType);
        n.setRelatedId(relatedId);
        n.setIsRead(0);
        n.setCreateTime(LocalDateTime.now());
        save(n);
    }

    public List<Notification> getUserNotifications(Integer userId) {
        return lambdaQuery()
                .eq(Notification::getUserId, userId)
                .orderByDesc(Notification::getCreateTime)
                .list();
    }

    public long getUnreadCount(Integer userId) {
        return lambdaQuery()
                .eq(Notification::getUserId, userId)
                .eq(Notification::getIsRead, 0)
                .count();
    }

    public void markAsRead(Integer notifId) {
        Notification n = getById(notifId);
        if (n != null) {
            n.setIsRead(1);
            updateById(n);
        }
    }

    public void markAllAsRead(Integer userId) {
        lambdaUpdate()
                .eq(Notification::getUserId, userId)
                .eq(Notification::getIsRead, 0)
                .set(Notification::getIsRead, 1)
                .update();
    }
}
