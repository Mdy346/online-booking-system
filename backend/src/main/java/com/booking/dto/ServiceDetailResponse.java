package com.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ServiceDetailResponse {
    private Integer serviceId;
    private String serviceName;
    private String description;
    private BigDecimal price;
    private String category;
    private Integer merchantId;
    private String merchantName;
    private String merchantPhone;
    private Double rating;
    private Integer reviewCount;
    private List<ScheduleItem> schedules;

    @Data
    @AllArgsConstructor
    public static class ScheduleItem {
        private Integer scheduleId;
        private String startTime;
        private String endTime;
        private Integer capacity;
        private Integer bookedCount;
        private boolean available;
    }
}
