package com.booking.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.booking.common.BusinessException;
import com.booking.dto.ServiceDetailResponse.ScheduleItem;
import com.booking.entity.Schedule;
import com.booking.mapper.ScheduleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class ScheduleService extends ServiceImpl<ScheduleMapper, Schedule> {

    private static final DateTimeFormatter DTF = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /** Get available (future) schedules for a given ServiceItem. */
    public List<ScheduleItem> getSchedules(Integer serviceId) {
        List<Schedule> schedules = lambdaQuery()
                .eq(Schedule::getServiceId, serviceId)
                .ge(Schedule::getStartTime, LocalDateTime.now())
                .orderByAsc(Schedule::getStartTime)
                .list();

        return schedules.stream()
                .map(this::toScheduleItem)
                .collect(Collectors.toList());
    }

    /** Lock a schedule slot: atomically increment booked_count if capacity not exceeded. */
    @Transactional
    public void lockSlot(Integer scheduleId) {
        Schedule schedule = getById(scheduleId);
        if (schedule == null) {
            throw BusinessException.notFound("排班时段");
        }
        if (schedule.getBookedCount() >= schedule.getCapacity()) {
            throw BusinessException.slotFull();
        }
        // Atomic update: booked_count = booked_count + 1 where booked_count < capacity
        boolean updated = lambdaUpdate()
                .eq(Schedule::getScheduleId, scheduleId)
                .lt(Schedule::getBookedCount, schedule.getCapacity())
                .setSql("booked_count = booked_count + 1")
                .update();
        if (!updated) {
            throw BusinessException.slotFull();
        }
    }

    /** Release a lock (decrement booked_count). Used when appointment is cancelled. */
    @Transactional
    public void releaseSlot(Integer scheduleId) {
        lambdaUpdate()
                .eq(Schedule::getScheduleId, scheduleId)
                .gt(Schedule::getBookedCount, 0)
                .setSql("booked_count = booked_count - 1")
                .update();
    }

    public ScheduleItem toScheduleItem(Schedule s) {
        ScheduleItem item = new ScheduleItem(
                s.getScheduleId(),
                s.getStartTime().format(DTF),
                s.getEndTime().format(DTF),
                s.getCapacity(),
                s.getBookedCount(),
                s.getBookedCount() < s.getCapacity()
        );
        return item;
    }
}



