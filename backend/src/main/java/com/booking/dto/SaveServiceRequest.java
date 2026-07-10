package com.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class SaveServiceRequest {
    @NotBlank(message = "服务名")
    private String serviceName;

    private String description;

    @NotNull(message = "服务价格")
    private BigDecimal price;

    @NotBlank(message = "服务类型")
    private String category;

    @NotNull(message = "商家")
    private Integer merchantId;
}
