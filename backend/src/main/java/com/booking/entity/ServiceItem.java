package com.booking.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;

/**
 * Service entity — maps to T_Service table.
 * Represents a service item published by a merchant.
 */
@Data
@TableName("T_Service")
public class ServiceItem {

    @TableId(type = IdType.AUTO)
    private Integer serviceId;

    private String serviceName;

    private String description;

    private BigDecimal price;

    private String category;

    private Integer merchantId;
}


