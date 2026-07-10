package com.booking.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Schedule entity ? maps to T_Schedule table.
 * Represents a bookable time slot for a specific service.
 */
@Data
@TableName("T_Schedule")
public class Schedule {

    @TableId(type = IdType.AUTO)
    private Integer scheduleId;

    private Integer serviceId;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;

    private Integer capacity;

    private Integer bookedCount;
}
