package com.booking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateAppointmentRequest {
    @NotNull(message = "服务ID不能为空")
    private Integer serviceId;

    @NotNull(message = "排班时段ID不能为空")
    private Integer scheduleId;
}
