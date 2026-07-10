package com.booking.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.booking.common.BusinessException;
import com.booking.dto.SaveServiceRequest;
import com.booking.dto.ServiceDetailResponse;
import com.booking.dto.ServiceListQuery;
import com.booking.entity.ServiceItem;
import com.booking.entity.User;
import com.booking.mapper.ServiceMapper;
import com.booking.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceService extends ServiceImpl<ServiceMapper, ServiceItem> {

    private final ScheduleService scheduleService;
    private final UserMapper userMapper;

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
        if (query.getMerchantId() != null) {
            wrapper.eq(ServiceItem::getMerchantId, query.getMerchantId());
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

    public ServiceDetailResponse getServiceDetail(Integer serviceId) {
        ServiceItem serviceItem = getById(serviceId);
        if (serviceItem == null) return null;
        return toDetailResponse(serviceItem);
    }

    @Transactional
    public ServiceDetailResponse createService(SaveServiceRequest req) {
        ServiceItem item = new ServiceItem();
        item.setServiceName(req.getServiceName());
        item.setDescription(req.getDescription());
        item.setPrice(req.getPrice());
        item.setCategory(req.getCategory());
        item.setMerchantId(req.getMerchantId());
        save(item);
        return getServiceDetail(item.getServiceId());
    }

    @Transactional
    public ServiceDetailResponse updateService(Integer serviceId, SaveServiceRequest req) {
        ServiceItem item = getById(serviceId);
        if (item == null) throw new BusinessException(404, "服务不存在,更新失败");
        if (req.getServiceName() != null) item.setServiceName(req.getServiceName());
        if (req.getDescription() != null) item.setDescription(req.getDescription());
        if (req.getPrice() != null) item.setPrice(req.getPrice());
        if (req.getCategory() != null) item.setCategory(req.getCategory());
        updateById(item);
        return getServiceDetail(serviceId);
    }

    @Transactional
    public void deleteService(Integer serviceId) {
        ServiceItem item = getById(serviceId);
        if (item == null) throw new BusinessException(404, "服务不存在,删除失败");
        removeById(serviceId);
    }

    private ServiceDetailResponse toDetailResponse(ServiceItem serviceItem) {
        ServiceDetailResponse resp = new ServiceDetailResponse();
        resp.setServiceId(serviceItem.getServiceId());
        resp.setServiceName(serviceItem.getServiceName());
        resp.setDescription(serviceItem.getDescription());
        resp.setPrice(serviceItem.getPrice());
        resp.setCategory(serviceItem.getCategory());
        resp.setMerchantId(serviceItem.getMerchantId());

        User merchant = userMapper.selectById(serviceItem.getMerchantId());
        if (merchant != null) {
            resp.setMerchantName(merchant.getUsername());
            resp.setMerchantPhone(merchant.getPhone());
        }

        resp.setSchedules(scheduleService.getSchedules(serviceItem.getServiceId()));
        resp.setRating(4.5);
        resp.setReviewCount(0);

        return resp;
    }
}
