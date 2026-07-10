package com.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class SaveServiceRequest {
    @NotBlank(message = "????????")
    private String serviceName;

    private String description;

    @NotNull(message = "??????")
    private BigDecimal price;

    @NotBlank(message = "??????")
    private String category;

    @NotNull(message = "??ID????")
    private Integer merchantId;
}
