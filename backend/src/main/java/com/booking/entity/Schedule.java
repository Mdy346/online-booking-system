package com.booking.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Schedule entity — maps to T_Schedule table.
 * Represents a bookable time slot for a specific service.
 */
@Data
@TableName("T_Schedule")
public class Schedule {

    @TableId(type = IdType.AUTO)
    private Integer scheduleId;

    private Integer serviceId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer capacity;

    private Integer bookedCount;
}
