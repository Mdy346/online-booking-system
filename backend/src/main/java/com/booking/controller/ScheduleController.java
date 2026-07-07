package com.booking.controller;

import com.booking.common.ApiResponse;
import com.booking.dto.ServiceDetailResponse.ScheduleItem;
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
        List<ScheduleItem> schedules = scheduleService.getSchedules(serviceId);
        return ApiResponse.success(schedules);
    }
}
