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
import java.util.stream.Collectors; @Service
@RequiredArgsConstructor
public class AppointmentService extends ServiceImpl<AppointmentMapper, Appointment> {

    private final ScheduleService scheduleService;
    private final ServiceService serviceService;
    private final UserService userService;

    private static final DateTimeFormatter DTF = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Create a new appointment.
     * 1. Lock the schedule slot (check capacity)
     * 2. Create the order with status = PENDING (1)
     */
    @Transactional
    public AppointmentVo create(Integer userId, Integer serviceId, Integer scheduleId) {
        // Validate ServiceItem exists
        ServiceItem serviceItem = serviceService.getById(serviceId);
        if (serviceItem == null) {
            throw BusinessException.notFound("服务项目");
        }
        // Lock slot (atomic capacity check + increment)
        scheduleService.lockSlot(scheduleId);

        Appointment appointment = new Appointment();
        appointment.setUserId(userId);
        appointment.setServiceId(serviceId);
        appointment.setScheduleId(scheduleId);
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setCreateTime(LocalDateTime.now());
        save(appointment);

        return toVo(appointment);
    }

    /** Cancel an appointment (user-initiated). */
    @Transactional
    public void cancel(Integer appointmentId, Integer userId) {
        Appointment appointment = getById(appointmentId);
        if (appointment == null) throw BusinessException.notFound("预约订单");
        if (!appointment.getUserId().equals(userId)) {
            throw BusinessException.forbidden();
        }
        if (appointment.getStatus() != AppointmentStatus.PENDING
                && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw BusinessException.conflict("当前状态不允许取消");
        }
        appointment.setStatus(AppointmentStatus.CANCELLED);
        updateById(appointment);
        scheduleService.releaseSlot(appointment.getScheduleId());
    }

    /** Confirm an appointment (merchant action). */
    @Transactional
    public void confirm(Integer appointmentId) {
        Appointment appointment = getById(appointmentId);
        if (appointment == null) throw BusinessException.notFound("预约订单");
        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw BusinessException.conflict("只有待确认状态的订单可以确认");
        }
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        updateById(appointment);
    }

    /** Reject an appointment (merchant action). */
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
    }

    /** Get all appointments for a specific user. */
    public List<AppointmentVo> getUserAppointments(Integer userId) {
        List<Appointment> list = lambdaQuery()
                .eq(Appointment::getUserId, userId)
                .orderByDesc(Appointment::getCreateTime)
                .list();
        return list.stream().map(this::toVo).collect(Collectors.toList());
    }

    /** Get all appointments for a merchant's services. */
    public List<AppointmentVo> getMerchantAppointments(Integer merchantId) {
        // First find all services owned by this merchant
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

    /** Convert entity to view object with joined service/user info. */
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

    // Inner class for appointment view object
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



