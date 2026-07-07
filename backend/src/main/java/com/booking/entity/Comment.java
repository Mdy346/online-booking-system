package com.booking.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Comment entity — maps to T_Comment table.
 * Rating stars range from 1 to 5.
 */
@Data
@TableName("T_Comment")
public class Comment {

    @TableId(type = IdType.AUTO)
    private Integer commentId;

    private Integer appointmentId;

    private Integer ratingStar;

    private String content;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime commentTime;
}
