package com.booking.controller;

import com.booking.common.ApiResponse;
import com.booking.dto.CreateAppointmentRequest;
import com.booking.service.AppointmentService;
import com.booking.service.AppointmentService.AppointmentVo;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ApiResponse<AppointmentVo> create(
            @RequestBody @Valid CreateAppointmentRequest req,
            @RequestParam(required = false) Integer userId) {
        AppointmentVo vo = appointmentService.create(userId, req.getServiceId(), req.getScheduleId());
        return ApiResponse.success("预约申请已提交，等待商家审核", vo);
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<AppointmentVo>> getUserAppointments(@PathVariable Integer userId) {
        return ApiResponse.success(appointmentService.getUserAppointments(userId));
    }

    @GetMapping("/merchant/{merchantId}")
    public ApiResponse<List<AppointmentVo>> getMerchantAppointments(@PathVariable Integer merchantId) {
        return ApiResponse.success(appointmentService.getMerchantAppointments(merchantId));
    }

    @PutMapping("/{id}/cancel")
    public ApiResponse<Void> cancel(@PathVariable Integer id, @RequestParam Integer userId) {
        appointmentService.cancel(id, userId);
        return ApiResponse.success("预约已取消");
    }

    @PutMapping("/{id}/confirm")
    public ApiResponse<Void> confirm(@PathVariable Integer id) {
        appointmentService.confirm(id);
        return ApiResponse.success("预约已确认");
    }

    @PutMapping("/{id}/reject")
    public ApiResponse<Void> reject(@PathVariable Integer id) {
        appointmentService.reject(id);
        return ApiResponse.success("预约已拒绝");
    }
}
