package com.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateScheduleRequest {
    @NotNull(message = "服务ID不能为空")
    private Integer serviceId;

    @NotBlank(message = "开始时间不能为空")
    private String startTime;

    @NotBlank(message = "结束时间不能为空")
    private String endTime;

    @NotNull(message = "容量不能为空")
    private Integer capacity;
}
