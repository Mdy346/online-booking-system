package com.booking.controller;

import com.booking.common.ApiResponse;
import com.booking.dto.ServiceDetailResponse;
import com.booking.dto.ServiceListQuery;
import com.booking.entity.ServiceItem;
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
        return ApiResponse.success(serviceService.listServices(query));
    }

    @GetMapping("/{serviceId}")
    public ApiResponse<ServiceDetailResponse> getServiceDetail(@PathVariable Integer serviceId) {
        ServiceDetailResponse detail = serviceService.getServiceDetail(serviceId);
        if (detail == null) return ApiResponse.error(404, "获取失败");
        return ApiResponse.success(detail);
    }

    @PostMapping
    public ApiResponse<ServiceItem> create(@RequestBody ServiceItem service) {
        serviceService.save(service);
        return ApiResponse.success(service);
    }

    @PutMapping("/{serviceId}")
    public ApiResponse<ServiceItem> update(@PathVariable Integer serviceId, @RequestBody ServiceItem service) {
        service.setServiceId(serviceId);
        serviceService.updateById(service);
        return ApiResponse.success(service);
    }

    @DeleteMapping("/{serviceId}")
    public ApiResponse<Void> delete(@PathVariable Integer serviceId) {
        serviceService.removeById(serviceId);
        return ApiResponse.success("删除成功");
    }
}
