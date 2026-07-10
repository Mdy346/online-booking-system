package com.booking.controller;

import com.booking.common.ApiResponse;
import com.booking.dto.ServiceDetailResponse.ScheduleItem;
import com.booking.entity.Schedule;
import com.booking.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping
    public ApiResponse<List<ScheduleItem>> getSchedules(@RequestParam Integer serviceId) {
        return ApiResponse.success(scheduleService.getSchedules(serviceId));
    }

    @PostMapping
    public ApiResponse<Schedule> create(@RequestBody Schedule schedule) {
        scheduleService.save(schedule);
        return ApiResponse.success(schedule);
    }

    @DeleteMapping("/{scheduleId}")
    public ApiResponse<Void> delete(@PathVariable Integer scheduleId) {
        scheduleService.removeById(scheduleId);
        return ApiResponse.success("删除成功");
    }
}
