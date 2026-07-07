package com.booking.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Appointment entity — maps to T_Appointment table.
 * Status codes: 1=待确认, 2=已确认, 3=已拒绝, 4=已取消, 5=已完成
 */
@Data
@TableName("T_Appointment")
public class Appointment {

    @TableId(type = IdType.AUTO)
    private Integer appointmentId;

    private Integer userId;

    private Integer serviceId;

    private Integer scheduleId;

    private Integer status;   // 1-5 per data dictionary

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
