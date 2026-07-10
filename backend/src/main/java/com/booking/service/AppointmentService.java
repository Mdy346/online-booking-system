package com.booking.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.booking.common.AppointmentStatus;
import com.booking.common.BusinessException;
import com.booking.entity.Appointment;
import com.booking.entity.Schedule;
import com.booking.entity.ServiceItem;
import com.booking.entity.User;
import com.booking.mapper.AppointmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService extends ServiceImpl<AppointmentMapper, Appointment> {

    private final ScheduleService scheduleService;
    private final ServiceService serviceService;
    private final UserService userService;
    private final NotificationService notificationService;

    private static final DateTimeFormatter DTF = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Transactional
    public AppointmentVo create(Integer userId, Integer serviceId, Integer scheduleId) {
        ServiceItem serviceItem = serviceService.getById(serviceId);
        if (serviceItem == null) throw BusinessException.notFound("服务项目");

        scheduleService.lockSlot(scheduleId);

        Appointment appointment = new Appointment();
        appointment.setUserId(userId);
        appointment.setServiceId(serviceId);
        appointment.setScheduleId(scheduleId);
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setCreateTime(LocalDateTime.now());
        save(appointment);

        // 通知商家：有新的预约
        notificationService.createNotification(
                serviceItem.getMerchantId(),
                "新的预约",
                "您有一个新的预约待处理",
                "APPOINTMENT", appointment.getAppointmentId());

        return toVo(appointment);
    }

    @Transactional
    public void cancel(Integer appointmentId, Integer userId) {
        Appointment appointment = getById(appointmentId);
        if (appointment == null) throw BusinessException.notFound("预约订单");
        if (!appointment.getUserId().equals(userId)) throw BusinessException.forbidden();
        if (appointment.getStatus() != AppointmentStatus.PENDING
                && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw BusinessException.conflict("当前状态不允许取消");
        }
        appointment.setStatus(AppointmentStatus.CANCELLED);
        updateById(appointment);
        scheduleService.releaseSlot(appointment.getScheduleId());

        // 通知商家：用户取消了预约
        ServiceItem serviceItem = serviceService.getById(appointment.getServiceId());
        if (serviceItem != null) {
            notificationService.createNotification(
                    serviceItem.getMerchantId(),
                    "预约已取消",
                    "用户取消了预约",
                    "APPOINTMENT", appointmentId);
        }
    }

    @Transactional
    public void confirm(Integer appointmentId) {
        Appointment appointment = getById(appointmentId);
        if (appointment == null) throw BusinessException.notFound("预约订单");
        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw BusinessException.conflict("只有待确认状态的订单可以确认");
        }
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        updateById(appointment);

        // 通知用户：预约已确认
        notificationService.createNotification(
                appointment.getUserId(),
                "预约已确认",
                "您的预约已确认",
                "APPOINTMENT", appointmentId);
    }

    @Transactional
    public void complete(Integer appointmentId) {
        Appointment appointment = getById(appointmentId);
        if (appointment == null) throw BusinessException.notFound("预约订单");
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw BusinessException.conflict("只有已确认状态的订单可以标记为已完成");
        }
        appointment.setStatus(AppointmentStatus.COMPLETED);
        updateById(appointment);

        // 通知用户：预约已完成，请评价
        notificationService.createNotification(
                appointment.getUserId(),
                "预约已完成",
                "预约已完成，请评价",
                "APPOINTMENT", appointmentId);
    }

    @Transactional
    public void reject(Integer appointmentId) {
        Appointment appointment = getById(appointmentId);
        if (appointment == null) throw BusinessException.notFound("预约订单");
        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw BusinessException.conflict("只有待确认状态的订单可以拒绝");
        }
        appointment.setStatus(AppointmentStatus.REJECTED);
        updateById(appointment);
        scheduleService.releaseSlot(appointment.getScheduleId());

        // 通知用户：预约被拒绝
        notificationService.createNotification(
                appointment.getUserId(),
                "预约已拒绝",
                "您的预约已被拒绝",
                "APPOINTMENT", appointmentId);
    }

    public List<AppointmentVo> getUserAppointments(Integer userId) {
        List<Appointment> list = lambdaQuery()
                .eq(Appointment::getUserId, userId)
                .orderByDesc(Appointment::getCreateTime)
                .list();
        return list.stream().map(this::toVo).collect(Collectors.toList());
    }

    public List<AppointmentVo> getMerchantAppointments(Integer merchantId) {
        List<ServiceItem> merchantServices = serviceService.lambdaQuery()
                .eq(ServiceItem::getMerchantId, merchantId)
                .list();
        Set<Integer> serviceIds = merchantServices.stream()
                .map(ServiceItem::getServiceId)
                .collect(Collectors.toSet());
        if (serviceIds.isEmpty()) return Collections.emptyList();

        List<Appointment> list = lambdaQuery()
                .in(Appointment::getServiceId, serviceIds)
                .orderByDesc(Appointment::getCreateTime)
                .list();
        return list.stream().map(this::toVo).collect(Collectors.toList());
    }

    private AppointmentVo toVo(Appointment appointment) {
        ServiceItem serviceItem = serviceService.getById(appointment.getServiceId());
        Schedule schedule = scheduleService.getById(appointment.getScheduleId());
        User user = userService.getById(appointment.getUserId());
        User merchant = serviceItem != null ? userService.getById(serviceItem.getMerchantId()) : null;

        AppointmentVo vo = new AppointmentVo();
        vo.setAppointmentId(appointment.getAppointmentId());
        vo.setUserId(appointment.getUserId());
        vo.setUsername(user != null ? user.getUsername() : null);
        vo.setServiceId(appointment.getServiceId());
        vo.setServiceName(serviceItem != null ? serviceItem.getServiceName() : null);
        vo.setMerchantName(merchant != null ? merchant.getUsername() : null);
        vo.setScheduleId(appointment.getScheduleId());
        vo.setStartTime(schedule != null ? schedule.getStartTime().format(DTF) : null);
        vo.setEndTime(schedule != null ? schedule.getEndTime().format(DTF) : null);
        vo.setPrice(serviceItem != null ? serviceItem.getPrice() : null);
        vo.setStatus(appointment.getStatus());
        vo.setCreateTime(appointment.getCreateTime() != null
                ? appointment.getCreateTime().format(DTF) : null);
        return vo;
    }

    @lombok.Data
    public static class AppointmentVo {
        private Integer appointmentId;
        private Integer userId;
        private String username;
        private Integer serviceId;
        private String serviceName;
        private String merchantName;
        private Integer scheduleId;
        private String startTime;
        private String endTime;
        private java.math.BigDecimal price;
        private Integer status;
        private String createTime;
    }
}
