package com.booking.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.booking.dto.ServiceDetailResponse;
import com.booking.dto.ServiceListQuery;
import com.booking.entity.ServiceItem;
import com.booking.entity.User;
import com.booking.mapper.ServiceMapper;
import com.booking.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors; @Service
@RequiredArgsConstructor
public class ServiceService extends ServiceImpl<ServiceMapper, ServiceItem> {

    private final ScheduleService scheduleService;
    private final UserMapper userMapper;

    /** List services with optional keyword, category, and sort. */
    public List<ServiceDetailResponse> listServices(ServiceListQuery query) {
        LambdaQueryWrapper<ServiceItem> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(query.getKeyword())) {
            String kw = query.getKeyword();
            wrapper.and(w -> w
                    .like(ServiceItem::getServiceName, kw)
                    .or()
                    .like(ServiceItem::getDescription, kw));
        }
        if (StringUtils.hasText(query.getCategory())) {
            wrapper.eq(ServiceItem::getCategory, query.getCategory());
        }

        List<ServiceItem> services = list(wrapper);

        List<ServiceDetailResponse> result = services.stream()
                .map(this::toDetailResponse)
                .collect(Collectors.toList());

        if ("price".equals(query.getSortBy())) {
            result.sort(Comparator.comparing(ServiceDetailResponse::getPrice));
        } else if ("rating".equals(query.getSortBy())) {
            result.sort(Comparator.comparing(ServiceDetailResponse::getRating).reversed());
        }

        return result;
    }

    /** Get full service detail including schedules and merchant info. */
    public ServiceDetailResponse getServiceDetail(Integer serviceId) {
        ServiceItem serviceItem = getById(serviceId);
        if (serviceItem == null) return null;
        return toDetailResponse(serviceItem);
    }

    private ServiceDetailResponse toDetailResponse(ServiceItem serviceItem) {
        ServiceDetailResponse resp = new ServiceDetailResponse();
        resp.setServiceId(serviceItem.getServiceId());
        resp.setServiceName(serviceItem.getServiceName());
        resp.setDescription(serviceItem.getDescription());
        resp.setPrice(serviceItem.getPrice());
        resp.setCategory(serviceItem.getCategory());
        resp.setMerchantId(serviceItem.getMerchantId());

        // Lookup merchant info
        User merchant = userMapper.selectById(serviceItem.getMerchantId());
        if (merchant != null) {
            resp.setMerchantName(merchant.getUsername());
            resp.setMerchantPhone(merchant.getPhone());
        }

        // Get schedules for this ServiceItem
        resp.setSchedules(scheduleService.getSchedules(serviceItem.getServiceId()));

        // Placeholder rating data
        resp.setRating(4.5);
        resp.setReviewCount(0);

        return resp;
    }
}




