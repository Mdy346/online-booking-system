package com.booking.controller;

import com.booking.common.ApiResponse;
import com.booking.dto.ServiceDetailResponse;
import com.booking.dto.ServiceListQuery;
import com.booking.service.ServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

    @GetMapping
    public ApiResponse<List<ServiceDetailResponse>> listServices(ServiceListQuery query) {
        List<ServiceDetailResponse> list = serviceService.listServices(query);
        return ApiResponse.success(list);
    }

    @GetMapping("/{serviceId}")
    public ApiResponse<ServiceDetailResponse> getServiceDetail(@PathVariable Integer serviceId) {
        ServiceDetailResponse detail = serviceService.getServiceDetail(serviceId);
        if (detail == null) {
            return ApiResponse.error(404, "服务项目不存在");
        }
        return ApiResponse.success(detail);
    }
}
