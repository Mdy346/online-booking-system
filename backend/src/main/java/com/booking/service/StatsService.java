package com.booking.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.booking.common.AppointmentStatus;
import com.booking.entity.Appointment;
import com.booking.entity.Comment;
import com.booking.entity.ServiceItem;
import com.booking.mapper.AppointmentMapper;
import com.booking.mapper.CommentMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class StatsService {

    private final AppointmentMapper appointmentMapper;
    private final CommentMapper commentMapper;
    private final ServiceService serviceService;

    /** Get merchant statistics dashboard data. */
    public MerchantStatsVo getMerchantStats(Integer merchantId) {
        // Get all services for this merchant
        List<ServiceItem> services = serviceService.lambdaQuery()
                .eq(ServiceItem::getMerchantId, merchantId)
                .list();
        List<Integer> serviceIds = services.stream()
                .map(ServiceItem::getServiceId)
                .collect(Collectors.toList());

        if (serviceIds.isEmpty()) {
            return new MerchantStatsVo();
        }

        // Get all appointments for these services
        List<Appointment> appointments = appointmentMapper.selectList(
                new LambdaQueryWrapper<Appointment>()
                        .in(Appointment::getServiceId, serviceIds));

        int total = appointments.size();
        int completed = (int) appointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count();
        int cancelled = (int) appointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED).count();

        // Get average rating from comments
        List<Integer> appointmentIds = appointments.stream()
                .map(Appointment::getAppointmentId)
                .collect(Collectors.toList());

        double avgRating = 0.0;
        if (!appointmentIds.isEmpty()) {
            List<Comment> comments = commentMapper.selectList(
                    new LambdaQueryWrapper<Comment>()
                            .in(Comment::getAppointmentId, appointmentIds));
            avgRating = comments.stream()
                    .mapToInt(Comment::getRatingStar)
                    .average()
                    .orElse(0.0);
        }

        // Daily trend for last 14 days
        LocalDate today = LocalDate.now();
        List<DailyCount> dailyTrend = new ArrayList<>();
        for (int i = 13; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            final LocalDate d = date;
            long count = appointments.stream()
                    .filter(a -> a.getCreateTime() != null
                            && a.getCreateTime().toLocalDate().equals(d))
                    .count();
            dailyTrend.add(new DailyCount(date.format(DateTimeFormatter.ISO_LOCAL_DATE), (int) count));
        }

        MerchantStatsVo stats = new MerchantStatsVo();
        stats.setTotalAppointments(total);
        stats.setCompletedAppointments(completed);
        stats.setCancelledAppointments(cancelled);
        stats.setAverageRating(Math.round(avgRating * 10.0) / 10.0);
        stats.setDailyTrend(dailyTrend);
        return stats;
    }

    @Data
    public static class MerchantStatsVo {
        private int totalAppointments;
        private int completedAppointments;
        private int cancelledAppointments;
        private double averageRating;
        private List<DailyCount> dailyTrend = Collections.emptyList();
    }

    @Data
    public static class DailyCount {
        private final String date;
        private final int count;
    }
}



